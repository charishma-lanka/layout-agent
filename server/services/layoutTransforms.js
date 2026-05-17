// server/services/layoutTransforms.js

export function resizeArtboard(layout, newWidth, newHeight) {
  const layoutCopy = JSON.parse(JSON.stringify(layout));
  const artboardId = layoutCopy.rootNodes[0];
  const artboard = layoutCopy.nodes[artboardId];
  
  const oldWidth = artboard.width;
  const oldHeight = artboard.height;
  
  artboard.width = newWidth;
  artboard.height = newHeight;
  
  for (const [id, node] of Object.entries(layoutCopy.nodes)) {
    if (node.nx !== undefined && id !== artboardId) {
      node.x = node.nx * newWidth;
      node.y = node.ny * newHeight;
      node.width = node.nw * newWidth;
      node.height = node.nh * newHeight;
    }
    
    if (node.type === 'text' && node.style?.visual?.fontSize) {
      const widthRatio = newWidth / oldWidth;
      node.style.visual.fontSize = Math.round(node.style.visual.fontSize * widthRatio);
    }
  }
  
  return layoutCopy;
}

export function moveNode(layout, nodeId, position) {
  const layoutCopy = JSON.parse(JSON.stringify(layout));
  const artboardId = layoutCopy.rootNodes[0];
  const artboard = layoutCopy.nodes[artboardId];
  const node = layoutCopy.nodes[nodeId];
  
  if (!node) return layoutCopy;
  
  switch(position) {
    case 'top':
      node.y = 0;
      node.ny = 0;
      break;
    case 'bottom':
      node.y = artboard.height - node.height;
      node.ny = node.y / artboard.height;
      break;
    case 'center':
      node.x = (artboard.width - node.width) / 2;
      node.nx = node.x / artboard.width;
      break;
    case 'higher':
    case 'up':
      node.y = Math.max(0, node.y - 50);
      node.ny = node.y / artboard.height;
      break;
    case 'lower':
    case 'down':
      node.y = Math.min(artboard.height - node.height, node.y + 50);
      node.ny = node.y / artboard.height;
      break;
  }
  
  return layoutCopy;
}

export function findNodeByRole(layout, role) {
  const roleKeywords = {
    'headline': ['Luxury Comfort', 'luxury', 'comfort', 'Surprisingly Attainable', 'Comfort that defines'],
    'discount': ['20%', 'OFF', '% OFF'],
    'offer': ['Limited time', 'offer', 'Limited time offer'],
    'product': ['Product.png', 'product'],
  };
  
  const keywords = roleKeywords[role] || [];
  
  for (const [id, node] of Object.entries(layout.nodes)) {
    const content = node.data?.content || node.name || '';
    if (keywords.some(kw => content.toLowerCase().includes(kw.toLowerCase()))) {
      return { id, node };
    }
  }
  return null;
}

export function resizeText(layout, nodeId, scale) {
  const layoutCopy = JSON.parse(JSON.stringify(layout));
  const node = layoutCopy.nodes[nodeId];
  
  if (node.type === 'text' && node.style?.visual?.fontSize) {
    const oldFontSize = node.style.visual.fontSize;
    node.style.visual.fontSize = Math.round(oldFontSize * scale);
  }
  
  return layoutCopy;
}