import { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import {
  Search, X, RefreshCw, Loader2, AlertCircle,
  FileEdit, Clock, SearchCheck, CheckCircle,
  Truck, XCircle, Send, RotateCcw,
  Eye, Undo2, Check, Package, Ban, Trash2,
  Calendar, User, ShoppingBag, FileText, Activity
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { PreOrderContext } from '../context/PreOrderContext';
import { useToast } from '../components/Toast';
import './PreOrders.css';

const STATUS_CONFIG = {
  borrador:  { label: 'Borrador',  icon: FileEdit,    color: '#9CA3AF', bg: '#F3F4F6' },
  pendiente: { label: 'Pendiente', icon: Clock,       color: '#D4A962', bg: '#FEF9E7' },
  revisado:  { label: 'Revisado',  icon: SearchCheck, color: '#5B8DEF', bg: '#EBF2FF' },
  confirmado:{ label: 'Confirmado',icon: CheckCircle, color: '#5CA87A', bg: '#EDF7F0' },
  enviado:   { label: 'Enviado',   icon: Truck,       color: '#A78BFA', bg: '#F3EEFF' },
  rechazado: { label: 'Rechazado', icon: XCircle,     color: '#C45C5C', bg: '#FEF0F0' },
};

function getStatusActions(estado, roles) {
  const safeRoles = Array.isArray(roles) ? roles : [];
  const isClient = safeRoles.includes('client');
  const isCommercial = safeRoles.includes('commercial');
  const isAdmin = safeRoles.includes('superadmin') || safeRoles.includes('admin');

  if (isClient) {
    if (estado === 'borrador')  return [{ label: 'Enviar',          action: 'pendiente', icon: Send }];
    if (estado === 'pendiente') return [{ label: 'Volver a borrador', action: 'borrador', icon: RotateCcw }];
    return [];
  }
  if (isCommercial) {
    if (estado === 'pendiente')  return [{ label: 'Revisar',        action: 'revisado',  icon: Eye }];
    if (estado === 'confirmado') return [{ label: 'Enviar a almacén', action: 'enviado', icon: Package }];
    return [];
  }
  if (isAdmin) {
    if (estado === 'pendiente')  return [
      { label: 'Revisar',        action: 'revisado',  icon: Eye },
      { label: 'Rechazar',       action: 'rechazado',  icon: Ban },
    ];
    if (estado === 'revisado')   return [
      { label: 'Confirmar',      action: 'confirmado', icon: Check },
      { label: 'Rechazar',       action: 'rechazado',  icon: Ban },
      { label: 'Devolver',       action: 'pendiente',  icon: Undo2 },
    ];
    if (estado === 'confirmado') return [
      { label: 'Enviar a almacén', action: 'enviado',  icon: Package },
      { label: 'Rechazar',       action: 'rechazado',  icon: Ban },
    ];
    if (estado === 'rechazado')  return [
      { label: 'Reabrir',        action: 'borrador',   icon: RotateCcw },
    ];
    return [];
  }
  return [];
}

function formatFecha(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
}

function shortId(id) {
  if (!id) return '#???';
  const str = String(id);
  if (str.length <= 6) return `#${str}`;
  return `#${str.slice(-4)}`;
}

export default function PreOrders() {
  const { user, roles, isSuperadminOrAdmin, isClient, isCommercial, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  const { addToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Detail modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);
  const [modalClosing, setModalClosing] = useState(false);

  // Action state
  const [actionLoading, setActionLoading] = useState(null); // estado being processed or 'delete'
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [tableDeleteTarget, setTableDeleteTarget] = useState(null); // delete from table row (not modal)

  const modalRef = useRef(null);

  // ── Load orders ──
  // ── Client: watch for preorder sent events ──
  const preOrderCtx = useContext(PreOrderContext);
  const preorderSentVersion = preOrderCtx?.preorderSentVersion || 0;

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get('/preorders');
      // Handle various response shapes — ensure array
      const list = data?.preorders || data?.data || data?.orders || data;
      setOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Error al cargar pedidos';
      setError(msg);
      addToast(msg, 'error');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { loadOrders(); }, [loadOrders, preorderSentVersion]);

  // ── Load order detail ──
  const loadDetail = useCallback(async (orderId) => {
    try {
      setDetailLoading(true);
      const { data } = await api.get(`/preorders/${orderId}`);
      setDetailOrder(data?.data || data?.order || data);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Error al cargar detalle';
      addToast(msg, 'error');
    } finally {
      setDetailLoading(false);
    }
  }, [addToast]);

  // ── Open modal ──
  const openModal = useCallback((order) => {
    setModalClosing(false);
    setSelectedOrder(order);
    setDetailOrder(null);
    setDeleteConfirm(false);
    setActionLoading(null);
    loadDetail(order._id || order.id);
  }, [loadDetail]);

  // ── Close modal ──
  const closeModal = useCallback(() => {
    setModalClosing(true);
    setTimeout(() => {
      setSelectedOrder(null);
      setDetailOrder(null);
      setModalClosing(false);
      setDeleteConfirm(false);
      setActionLoading(null);
    }, 200);
  }, []);

  // ── Escape key ──
  useEffect(() => {
    if (!selectedOrder) return;
    const handler = (e) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedOrder, closeModal]);

  // ── Change status ──
  const handleStatusChange = useCallback(async (orderId, newEstado) => {
    if (actionLoading) return;
    try {
      setActionLoading(newEstado);
      await api.patch(`/preorders/${orderId}/estado`, { estado: newEstado });

      // Update local state
      const updateOrderState = (order) => {
        if ((order._id || order.id) === orderId) {
          return { ...order, estado: newEstado };
        }
        return order;
      };

      setOrders(prev => prev.map(updateOrderState));
      if (detailOrder && (detailOrder._id || detailOrder.id) === orderId) {
        setDetailOrder(prev => ({ ...prev, estado: newEstado }));
      }

      const cfg = STATUS_CONFIG[newEstado];
      addToast(`Pedido actualizado a "${cfg?.label || newEstado}"`, 'success');
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Error al actualizar estado';
      addToast(msg, 'error');
    } finally {
      setActionLoading(null);
    }
  }, [actionLoading, addToast, detailOrder]);

  // ── Delete order ──
  const handleDelete = useCallback(async (orderId) => {
    if (actionLoading === 'delete') return;
    try {
      setActionLoading('delete');
      await api.delete(`/preorders/${orderId}`);
      setOrders(prev => prev.filter(o => (o._id || o.id) !== orderId));
      addToast('Pedido eliminado', 'success');
      closeModal();
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Error al eliminar pedido';
      addToast(msg, 'error');
      setDeleteConfirm(false);
    } finally {
      setActionLoading(null);
    }
  }, [actionLoading, addToast, closeModal]);

  // ── Filter orders locally ──
  const filteredOrders = Array.isArray(orders) ? orders.filter(order => {
    const cliente = order.cliente || {};
    const comercial = order.comerciales?.[0] || {};
    const searchLower = search.toLowerCase();

    if (search) {
      const matchesCode = (order.pedidoId || order._id || '').toLowerCase().includes(searchLower);
      const matchesClientName = (cliente.nombre || '').toLowerCase().includes(searchLower);
      const matchesClientEmail = (cliente.email || '').toLowerCase().includes(searchLower);
      const matchesCommercial = (comercial.nombre || '').toLowerCase().includes(searchLower);
      if (!matchesCode && !matchesClientName && !matchesClientEmail && !matchesCommercial) return false;
    }

    if (statusFilter && order.estado !== statusFilter) return false;

    return true;
  }) : [];

  // ── Compute table totals ──
  const getItemsCount = (order) => {
    if (order.itemsCount !== undefined) return order.itemsCount;
    if (order.items?.length) return order.items.length;
    return '—';
  };

  const getTotalUnidades = (order) => {
    if (order.totalUnidades !== undefined) return order.totalUnidades;
    if (order.items?.length) return order.items.reduce((sum, item) => sum + (item.unidades || 0), 0);
    return '—';
  };

  // ── Render status badge ──
  const StatusBadge = ({ estado }) => {
    const cfg = STATUS_CONFIG[estado];
    if (!cfg) return <span className="status-badge" style={{ background: '#F3F4F6', color: '#9CA3AF' }}>{estado}</span>;
    const Icon = cfg.icon;
    return (
      <span className="status-badge" style={{ background: cfg.bg, color: cfg.color }}>
        <Icon size={14} />
        {cfg.label}
      </span>
    );
  };

  // ── Get display order for modal ──
  const displayOrder = detailOrder || selectedOrder;

  // ── Determine available actions for current order ──
  const orderActions = displayOrder ? getStatusActions(displayOrder.estado, roles) : [];
  const canDelete = isSuperadminOrAdmin && displayOrder;

  // ── Render ──
  return (
    <div className="preorders-page">
      {/* ── Header ── */}
      <div className="preorders-header">
        <div className="preorders-title-section">
          <h1>Pedidos</h1>
          <p className="preorders-count">
            {!loading && `${orders.length} pedido${orders.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="preorders-toolbar">
          <div className="preorders-search-wrapper">
            <Search className="preorders-search-icon" size={18} />
            <input
              type="text"
              className="preorders-search-input"
              placeholder="Buscar por código, cliente, comercial..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="preorders-search-clear" onClick={() => setSearch('')}>
                <X size={16} />
              </button>
            )}
          </div>
          <select
            className="preorders-filter-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">Todos los estados</option>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
          <button className="preorders-reload-btn" onClick={loadOrders} title="Recargar">
            <RefreshCw size={18} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="preorders-loading">
          <Loader2 className="spinner" size={36} />
          <p>Cargando pedidos...</p>
        </div>
      ) : error ? (
        <div className="preorders-error">
          <AlertCircle size={48} />
          <h3>Error al cargar pedidos</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadOrders}>Reintentar</button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="preorders-empty">
          <ShoppingBag size={48} />
          <h3>No hay pedidos</h3>
          <p>{search || statusFilter ? 'Ningún pedido coincide con los filtros.' : 'Aún no se han realizado pedidos.'}</p>
          {(search || statusFilter) && (
            <button className="btn btn-secondary" onClick={() => { setSearch(''); setStatusFilter(''); }}>
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="preorders-table-wrapper">
          <table className="preorders-table">
            <thead>
              <tr>
                <th className="th-id">Nº Pedido</th>
                <th className="th-client">Cliente</th>
                <th className="th-commercial">Comercial</th>
                <th className="th-date">Fecha</th>
                <th className="th-items">Items</th>
                <th className="th-total">Total</th>
                <th className="th-status">Estado</th>
                <th className="th-actions">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => {
                const cliente = order.cliente || {};
                const comercial = order.comerciales?.[0] || {};
                const actions = getStatusActions(order.estado, roles);

                return (
                  <tr
                    key={order._id || order.id}
                    className="preorders-row"
                    onClick={() => openModal(order)}
                  >
                    <td className="td-id">
                      <span className="order-id-badge">{order.pedidoId || shortId(order._id || order.id)}</span>
                    </td>
                    <td className="td-client">
                      <div className="td-client-inner">
                        <span className="td-client-name">{cliente.nombre || '—'}</span>
                        {cliente.email && <span className="td-client-email">{cliente.email}</span>}
                      </div>
                    </td>
                    <td className="td-commercial">
                      {comercial.nombre || '—'}
                    </td>
                    <td className="td-date">
                      <Calendar size={13} />
                      {formatFecha(order.createdAt)}
                    </td>
                    <td className="td-items">{getItemsCount(order)}</td>
                    <td className="td-total">{getTotalUnidades(order)}</td>
                    <td className="td-status">
                      <StatusBadge estado={order.estado} />
                    </td>
                    <td className="td-actions" onClick={e => e.stopPropagation()}>
                      <div className="td-actions-inner">
                        {actions.slice(0, 2).map((act, idx) => {
                          const Icon = act.icon;
                          const isProcessing = actionLoading === act.action;
                          return (
                            <button
                              key={idx}
                              className="preorders-action-btn"
                              title={act.label}
                              disabled={!!actionLoading}
                              onClick={() => handleStatusChange(order._id || order.id, act.action)}
                            >
                              {isProcessing ? <Loader2 size={14} className="spin" /> : <Icon size={14} />}
                              <span>{act.label}</span>
                            </button>
                          );
                        })}
                        {isSuperadminOrAdmin && (
                          <button
                            className="preorders-action-btn preorders-action-btn--danger"
                            title="Eliminar"
                            disabled={!!actionLoading}
                            onClick={() => setTableDeleteTarget(order)}
                          >
                            {actionLoading === 'delete' ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Delete confirmation from table ── */}
      {tableDeleteTarget && (
        <div className="preorders-modal-overlay" onClick={() => setTableDeleteTarget(null)}>
          <div className="preorders-modal preorders-modal--small" onClick={e => e.stopPropagation()}>
            <div className="preorders-modal-header">
              <h3>Eliminar pedido</h3>
              <button className="preorders-modal-close" onClick={() => setTableDeleteTarget(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="preorders-modal-body">
              <p>¿Estás seguro de que deseas eliminar este pedido?</p>
              <p className="preorders-delete-warning">Esta acción no se puede deshacer.</p>
            </div>
            <div className="preorders-modal-footer">
              <button className="btn btn-secondary" onClick={() => setTableDeleteTarget(null)}>Cancelar</button>
              <button
                className="btn btn-primary"
                style={{ background: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                onClick={async () => {
                  const id = tableDeleteTarget._id || tableDeleteTarget.id;
                  await handleDelete(id);
                  setTableDeleteTarget(null);
                }}
                disabled={actionLoading === 'delete'}
              >
                {actionLoading === 'delete' ? <Loader2 size={16} className="spin" /> : null}
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail Modal ── */}
      {selectedOrder && !deleteConfirm && (
        <div
          className={`preorders-modal-overlay${modalClosing ? ' closing' : ''}`}
          onClick={closeModal}
        >
          <div
            ref={modalRef}
            className={`preorders-modal${modalClosing ? ' closing' : ''}`}
            onClick={e => e.stopPropagation()}
          >
            <div className="preorders-modal-header">
              <div className="preorders-modal-title">
                <h3>Pedido {displayOrder?.pedidoId || shortId(displayOrder?._id || displayOrder?.id)}</h3>
                {displayOrder && <StatusBadge estado={displayOrder.estado} />}
              </div>
              <button className="preorders-modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            {detailLoading ? (
              <div className="preorders-detail-loading">
                <Loader2 className="spinner" size={28} />
                <p>Cargando detalle...</p>
              </div>
            ) : displayOrder ? (
              <div className="preorders-modal-body">
                {/* ── Order Info ── */}
                <section className="preorders-info-section">
                  <h4><FileText size={16} /> Información del pedido</h4>
                  <div className="preorders-info-grid">
                    <div className="preorders-info-item">
                      <span className="preorders-info-label"><User size={14} /> Cliente</span>
                      <span className="preorders-info-value">
                        {displayOrder.cliente?.nombre || '—'}
                        {displayOrder.cliente?.email && (
                          <span className="preorders-info-sub">{displayOrder.cliente.email}</span>
                        )}
                      </span>
                    </div>
                    <div className="preorders-info-item">
                      <span className="preorders-info-label"><User size={14} /> Comercial</span>
                      <span className="preorders-info-value">{displayOrder.comerciales?.[0]?.nombre || '—'}</span>
                    </div>
                    <div className="preorders-info-item">
                      <span className="preorders-info-label"><Calendar size={14} /> Fecha</span>
                      <span className="preorders-info-value">{formatFecha(displayOrder.createdAt)}</span>
                    </div>
                    {displayOrder.notas && (
                      <div className="preorders-info-item preorders-info-item--full">
                        <span className="preorders-info-label"><Activity size={14} /> Observaciones</span>
                        <span className="preorders-info-value">{displayOrder.notas}</span>
                      </div>
                    )}
                  </div>
                </section>

                {/* ── Items ── */}
                {displayOrder.items?.length > 0 && (
                  <section className="preorders-items-section">
                    <h4><ShoppingBag size={16} /> Artículos ({displayOrder.items.length})</h4>
                    <div className="preorders-items-table-wrapper">
                      <table className="preorders-items-table">
                        <thead>
                          <tr>
                            <th>Código</th>
                            <th>Descripción</th>
                            <th className="th-num">Unidades</th>
                            <th className="th-num">Karrys</th>
                            <th className="th-num">Tablas</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayOrder.items.map((item, idx) => (
                            <tr key={item._id || item.codigo || idx}>
                              <td className="td-code">{item.codigo || item.codigoArticulo || '—'}</td>
                              <td className="td-desc">{item.descripcion || item.descripcionArticulo || '—'}</td>
                              <td className="td-num">{item.unidades ?? '—'}</td>
                              <td className="td-num">{item.karrys ?? '—'}</td>
                              <td className="td-num">{item.tablas ?? '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan="2" className="td-footer-label">Total</td>
                            <td className="td-num td-footer-value">
                              {displayOrder.items.reduce((s, i) => s + (i.unidades || 0), 0)}
                            </td>
                            <td className="td-num td-footer-value">
                              {displayOrder.items.reduce((s, i) => s + (i.karrys || 0), 0)}
                            </td>
                            <td className="td-num td-footer-value">
                              {displayOrder.items.reduce((s, i) => s + (i.tablas || 0), 0)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </section>
                )}

                {/* ── History ── */}
                {displayOrder.historial?.length > 0 && (
                  <section className="preorders-history-section">
                    <h4><Activity size={16} /> Historial de cambios</h4>
                    <div className="preorders-timeline">
                      {displayOrder.historial.map((entry, idx) => {
                        const cfg = STATUS_CONFIG[entry.estado] || {};
                        const Icon = cfg.icon || Activity;
                        return (
                          <div key={idx} className="preorders-timeline-item">
                            <div className="preorders-timeline-marker" style={{ background: cfg.color || '#9CA3AF' }}>
                              <Icon size={12} />
                            </div>
                            <div className="preorders-timeline-content">
                              <span className="preorders-timeline-state" style={{ color: cfg.color || '#9CA3AF' }}>
                                {cfg.label || entry.estado}
                              </span>
                              <span className="preorders-timeline-date">
                                {formatFecha(entry.at)}
                              </span>
                              {entry.by?.nombre && (
                                <span className="preorders-timeline-user">
                                  por {entry.by.nombre}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* ── Modal Actions ── */}
                {(orderActions.length > 0 || canDelete) && (
                  <div className="preorders-modal-actions">
                    <div className="preorders-modal-actions-group">
                      {orderActions.map((act, idx) => {
                        const Icon = act.icon;
                        const isProcessing = actionLoading === act.action;
                        return (
                          <button
                            key={idx}
                            className="btn btn-primary"
                            disabled={!!actionLoading}
                            onClick={() => handleStatusChange(displayOrder._id || displayOrder.id, act.action)}
                          >
                            {isProcessing ? <Loader2 size={16} className="spin" /> : <Icon size={16} />}
                            {act.label}
                          </button>
                        );
                      })}
                    </div>
                    {canDelete && (
                      <div className="preorders-modal-actions-danger">
                        {!deleteConfirm ? (
                          <button
                            className="preorders-action-btn preorders-action-btn--danger"
                            onClick={() => setDeleteConfirm(true)}
                            title="Eliminar pedido"
                          >
                            <Trash2 size={16} />
                            Eliminar
                          </button>
                        ) : (
                          <div className="preorders-delete-confirm">
                            <span>¿Eliminar este pedido?</span>
                            <div className="preorders-delete-confirm-actions">
                              <button
                                className="btn btn-secondary"
                                onClick={() => setDeleteConfirm(false)}
                                disabled={actionLoading === 'delete'}
                              >
                                Cancelar
                              </button>
                              <button
                                className="btn btn-primary"
                                style={{ background: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                                onClick={() => handleDelete(displayOrder._id || displayOrder.id)}
                                disabled={actionLoading === 'delete'}
                              >
                                {actionLoading === 'delete' ? <Loader2 size={16} className="spin" /> : null}
                                Sí, eliminar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
