import { motion } from 'framer-motion';
import { FaDownload, FaEye, FaPrint, FaTimes, FaQrcode } from 'react-icons/fa';
import { downloadInvoice, viewInvoice } from '../../../shared/utils/InvoiceGenerator';
import './Invoice.css';

const Invoice = ({ order, invoiceNumber, onClose }) => {
    // Calculate subtotal and GST
    const totalAmount = Number(order.totalAmount || order.total || 0);
    const subtotal = totalAmount / 1.18; // Assuming 18% GST is included
    const gst = totalAmount - subtotal;
    const invNum = invoiceNumber || order.invoiceNumber || `INV-${order.id}`;

    const handleDownload = () => {
        downloadInvoice(order, invNum);
    };

    const handleView = () => {
        viewInvoice(order, invNum);
    };

    const handlePrint = () => {
        window.print();
    };

    const customerName = order.customer?.name || order.shippingAddress?.name || order.user?.name || 'Customer';
    const customerEmail = order.customer?.email || order.shippingAddress?.email || order.user?.email || 'N/A';
    const customerAddress = order.customer?.address || 'N/A';
    const orderDate = new Date(order.date || order.createdAt).toLocaleDateString('en-IN');

    return (
        <motion.div
            className="invoice-component"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            {/* Action Bar (Not Printed) */}
            <div className="invoice-action-bar hide-on-print">
                <button className="btn btn-secondary action-btn" onClick={handleView}>
                    <FaEye /> View PDF
                </button>
                <button className="btn btn-primary action-btn" onClick={handleDownload}>
                    <FaDownload /> Download
                </button>
                <button className="btn btn-secondary action-btn" onClick={handlePrint}>
                    <FaPrint /> Print
                </button>
                {onClose && (
                    <button className="btn btn-danger action-btn close-btn" onClick={onClose}>
                        <FaTimes /> Close
                    </button>
                )}
            </div>

            {/* The actual Printable Document Area */}
            <div className="invoice-document printable-area">

                {/* Company Branding Header Band */}
                <div className="doc-company-header">
                    <div>
                        <div className="doc-company-name">KHM ELECTRONICS</div>
                        <div className="doc-company-sub">Polur Road, Bus Stand Opposite, Tiruvannamalai, Tamil Nadu 606601</div>
                        <div className="doc-company-sub">+91-9600882484 &nbsp;|&nbsp; mohamedirfan6604@gmail.com</div>
                    </div>
                    <div className="doc-company-url">{window.location.host}</div>
                </div>

                {/* Header Section */}
                <div className="doc-header">
                    <div className="doc-title">
                        <h1>PRINTABLE<br />INVOICE</h1>
                    </div>
                    <div className="doc-qr">
                        <FaQrcode className="qr-placeholder" />
                    </div>
                </div>

                {/* Section 1: Company Details */}
                <div className="doc-info-grid">
                    <div className="info-col">
                        <div className="info-row"><span className="info-label">Company:</span> <span className="info-val">KHM ELECTRONICS</span></div>
                        <div className="info-row"><span className="info-label">Address:</span> <span className="info-val">Polur Road, Bus Stand Opposite</span></div>
                        <div className="info-row"><span className="info-label">PostCode / City:</span> <span className="info-val">606601 Tiruvannamalai</span></div>
                        <div className="info-row"><span className="info-label">Location:</span> <span className="info-val">Tamil Nadu, India</span></div>
                        <div className="info-row"><span className="info-label">Sender Name:</span> <span className="info-val">KHM Admin</span></div>
                    </div>
                    <div className="info-col">
                        <div className="info-row"><span className="info-label">Telephone / E-mail:</span> <span className="info-val">+91-9600882484</span></div>
                        <div className="info-row"><span className="info-label">Shipping Date:</span> <span className="info-val">{new Date().toLocaleDateString('en-IN')}</span></div>
                        <div className="info-row"><span className="info-label">Shipping Number:</span> <span className="info-val">SHP-98765</span></div>
                        <div className="info-row"><span className="info-label">Sender VAT / GSTIN:</span> <span className="info-val">33AJYPI3741V1ZB</span></div>
                    </div>
                </div>

                <hr className="doc-divider" />

                {/* Section 2: Bill To & Order Details */}
                <div className="doc-info-grid">
                    <div className="info-col">
                        <div className="info-row send-to-header">
                            <span className="info-label heavy">Send To</span>
                            <div className="send-to-details">
                                <div className="info-row"><span className="info-label">Receiver Name:</span> <span className="info-val">{customerName}</span></div>
                                <div className="info-row"><span className="info-label">Address:</span> <span className="info-val">{customerAddress}</span></div>
                                <div className="info-row"><span className="info-label">Location:</span> <span className="info-val">India</span></div>
                                <div className="info-row"><span className="info-label">Telephone / E-mail:</span> <span className="info-val">{customerEmail}</span></div>
                                <div className="info-row"><span className="info-label">Receiver VAT Number:</span> <span className="info-val">-</span></div>
                            </div>
                        </div>
                    </div>
                    <div className="info-col right-align">
                        <div className="info-row"><span className="info-label">Invoice Number</span> <span className="info-val">{invNum}</span></div>
                        <div className="info-row"><span className="info-label">Date</span> <span className="info-val">{orderDate}</span></div>
                        <div className="info-row"><span className="info-label">Order Number</span> <span className="info-val">{order.id}</span></div>
                        <div className="info-row"><span className="info-label heavy">Country of Origin</span></div>
                        <div className="info-row"><span className="info-label heavy">Country of destination</span></div>
                        <div className="info-row"><span className="info-label heavy">Terms of Payment</span></div>
                        <div className="info-row"><span className="info-label heavy">Bill of Lading</span></div>
                    </div>
                </div>

                {/* Section 3: Items Table */}
                <div className="doc-table-container">
                    <table className="doc-table">
                        <thead>
                            <tr>
                                <th className="col-desc">Description</th>
                                <th className="col-qty">Quantity</th>
                                <th className="col-price">Unit price</th>
                                <th className="col-amount">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="col-desc">{item.name || item.product?.name || 'Item'}</td>
                                    <td className="col-qty">{item.quantity}</td>
                                    <td className="col-price">₹{Number(item.price).toLocaleString('en-IN')}</td>
                                    <td className="col-amount">₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Section 4: Totals */}
                <div className="doc-totals">
                    <div className="totals-row">
                        <span className="totals-label heavy">Subtotal</span>
                        <span className="totals-val">₹{subtotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="totals-row">
                        <span className="totals-label heavy">Discount (0%)</span>
                        <span className="totals-val">₹0.00</span>
                    </div>
                    <div className="totals-row">
                        <span className="totals-label heavy">Tax 1 (18% GST)</span>
                        <span className="totals-val">₹{gst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="totals-row grand-total-row">
                        <span className="totals-label heavy">Total</span>
                        <span className="totals-val">₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    </div>
                </div>

                {/* Footer Logo */}
                <div className="doc-footer-logo">
                    <div className="footer-brand">
                        <span className="brand-icon">⚡</span> KHM<span className="brand-green">Electronics</span>
                    </div>
                </div>

            </div>
        </motion.div>
    );
};

export default Invoice;
