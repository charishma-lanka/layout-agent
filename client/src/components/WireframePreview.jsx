// client/src/components/WireframePreview.jsx
import { useState } from 'react';

export default function WireframePreview({ layout }) {
  const [zoom, setZoom] = useState(1);
  const [selectedElement, setSelectedElement] = useState(null);
  
  if (!layout || !layout.rootNodes || !layout.nodes) {
    return <div className="preview-placeholder">Loading preview...</div>;
  }
  
  const artboardId = layout.rootNodes[0];
  const artboard = layout.nodes[artboardId];
  
  if (!artboard) {
    return <div className="preview-placeholder">No artboard found</div>;
  }
  
  const getNodeColor = (type, name) => {
    if (name?.toLowerCase().includes('background')) return { bg: '#e8f4f8', border: '#b8d4e8', icon: '🖼️' };
    if (name?.toLowerCase().includes('product')) return { bg: '#e8f5e9', border: '#81c784', icon: '📷' };
    if (type === 'text') {
      if (name?.toLowerCase().includes('headline') || name?.includes('Luxury')) 
        return { bg: '#fff3e0', border: '#ffb74d', icon: '📝' };
      return { bg: '#f3e5f5', border: '#ce93d8', icon: '✏️' };
    }
    if (type === 'shape') return { bg: '#fff8e1', border: '#ffd54f', icon: '⬤' };
    return { bg: '#e3f2fd', border: '#64b5f6', icon: '📦' };
  };

  const getNodeLabel = (node) => {
    if (node.data?.content) return node.data.content.substring(0, 25);
    if (node.name) return node.name.replace('.png', '').substring(0, 20);
    return node.type;
  };

  const aspectRatio = (artboard.height / artboard.width) * 100;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className="preview-container">
      {/* Toolbar */}
      <div className="preview-toolbar">
        <div className="preview-info">
          <span className="preview-badge">
            {artboard.width} × {artboard.height}
          </span>
          <span className="preview-badge">
            {artboard.children?.length || 0} layers
          </span>
        </div>
        <div className="preview-zoom">
          <button onClick={handleZoomOut} className="zoom-btn" title="Zoom Out">−</button>
          <span className="zoom-value">{Math.round(zoom * 100)}%</span>
          <button onClick={handleZoomIn} className="zoom-btn" title="Zoom In">+</button>
          <button onClick={handleResetZoom} className="zoom-btn reset" title="Reset">⟳</button>
        </div>
      </div>

      {/* Canvas */}
      <div className="preview-canvas-wrapper" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
        <div 
          className="preview-canvas"
          style={{
            width: `${artboard.width}px`,
            height: `${artboard.height}px`,
            backgroundColor: artboard.data?.backgroundColor || '#ffffff',
            backgroundImage: 'radial-gradient(circle, #ddd 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        >
          {artboard.children?.map(childId => {
            const node = layout.nodes[childId];
            if (!node) return null;
            
            const colors = getNodeColor(node.type, node.name);
            const isSelected = selectedElement === childId;
            
            return (
              <div
                key={childId}
                className={`preview-element ${isSelected ? 'selected' : ''}`}
                style={{
                  left: `${(node.nx || 0) * 100}%`,
                  top: `${(node.ny || 0) * 100}%`,
                  width: `${(node.nw || 0) * 100}%`,
                  height: `${(node.nh || 0) * 100}%`,
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                }}
                onClick={() => setSelectedElement(childId)}
              >
                <div className="preview-element-icon">{colors.icon}</div>
                <div className="preview-element-label">{getNodeLabel(node)}</div>
                
                {/* Badge for text elements */}
                {node.type === 'text' && node.style?.visual?.fontSize && (
                  <div className="preview-element-badge">
                    {node.style.visual.fontSize}px
                  </div>
                )}
                
                {/* Resize handle */}
                <div className="preview-resize-handle"></div>
              </div>
            );
          })}
          
          {/* Center crosshair */}
          <div className="preview-crosshair">
            <div className="crosshair-line horizontal"></div>
            <div className="crosshair-line vertical"></div>
          </div>
        </div>
      </div>

      {/* Layer Panel */}
      <div className="preview-layers">
        <div className="layers-header">
          <span>📁 Layers</span>
          <span className="layers-count">{artboard.children?.length || 0}</span>
        </div>
        <div className="layers-list">
          {artboard.children?.map(childId => {
            const node = layout.nodes[childId];
            if (!node) return null;
            return (
              <div 
                key={childId} 
                className={`layer-item ${selectedElement === childId ? 'active' : ''}`}
                onClick={() => setSelectedElement(childId)}
              >
                <span className="layer-icon">
                  {node.type === 'image' ? '🖼️' : node.type === 'text' ? '📝' : '🔘'}
                </span>
                <span className="layer-name">{node.name || node.type}</span>
                <span className="layer-type">{node.type}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}