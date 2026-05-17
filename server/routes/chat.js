// server/routes/chat.js
import express from 'express';
import { getLayoutUpdate } from '../services/llmService.js';
import { resizeArtboard, moveNode, findNodeByRole, resizeText } from '../services/layoutTransforms.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { message, layout, history } = req.body;
  
  console.log('📨 Received message:', message);
  
  try {
    let updatedLayout = JSON.parse(JSON.stringify(layout));
    let explanation = '';
    let usedLLM = false;
    
    const msgLower = message.toLowerCase();
    
    // COMMAND 1: Convert to 9:16
    if (msgLower.includes('9:16') || (msgLower.includes('convert') && msgLower.includes('story'))) {
      updatedLayout = resizeArtboard(updatedLayout, 1080, 1920);
      explanation = "✅ I've converted the design to 9:16 aspect ratio (1080×1920). The layout has been scaled proportionally.";
    }
    
    // COMMAND 2: Convert to 16:9
    else if (msgLower.includes('16:9') || (msgLower.includes('youtube') && msgLower.includes('aspect'))) {
      updatedLayout = resizeArtboard(updatedLayout, 1920, 1080);
      explanation = "✅ I've converted the design to 16:9 aspect ratio (1920×1080).";
    }
    
    // COMMAND 3: Move headline to top
    else if (msgLower.includes('move headline') && msgLower.includes('top')) {
      const result = findNodeByRole(updatedLayout, 'headline');
      if (result) {
        updatedLayout = moveNode(updatedLayout, result.id, 'top');
        explanation = "✅ I've moved the headline to the top of the canvas.";
      } else {
        explanation = "❌ Could not find the headline element.";
      }
    }
    
    // COMMAND 4: Move offer badge higher
    else if (msgLower.includes('offer badge') && (msgLower.includes('higher') || msgLower.includes('up'))) {
      const result = findNodeByRole(updatedLayout, 'offer');
      if (result) {
        updatedLayout = moveNode(updatedLayout, result.id, 'higher');
        explanation = "✅ I've moved the offer badge higher.";
      } else {
        explanation = "❌ Could not find the offer badge.";
      }
    }
    
    // COMMAND 5: Make headline smaller
    else if (msgLower.includes('headline') && msgLower.includes('smaller')) {
      const result = findNodeByRole(updatedLayout, 'headline');
      if (result) {
        updatedLayout = resizeText(updatedLayout, result.id, 0.8);
        explanation = "✅ I've made the headline smaller (reduced font size by 20%).";
      } else {
        explanation = "❌ Could not find the headline.";
      }
    }
    
    // COMMAND 6: Make headline bigger
    else if (msgLower.includes('headline') && (msgLower.includes('bigger') || msgLower.includes('larger'))) {
      const result = findNodeByRole(updatedLayout, 'headline');
      if (result) {
        updatedLayout = resizeText(updatedLayout, result.id, 1.2);
        explanation = "✅ I've made the headline larger (increased font size by 20%).";
      } else {
        explanation = "❌ Could not find the headline.";
      }
    }
    
    // COMMAND 7: Change headline color
    else if (msgLower.includes('headline') && msgLower.includes('color')) {
      const result = findNodeByRole(updatedLayout, 'headline');
      if (result) {
        // Extract color from message (red, blue, green, etc.)
        let color = '#FF0000'; // default red
        if (msgLower.includes('blue')) color = '#0000FF';
        else if (msgLower.includes('green')) color = '#00FF00';
        else if (msgLower.includes('yellow')) color = '#FFFF00';
        else if (msgLower.includes('black')) color = '#000000';
        
        if (result.node.style?.visual?.color) {
          result.node.style.visual.color.value = color;
        }
        updatedLayout = JSON.parse(JSON.stringify(updatedLayout));
        explanation = `✅ I've changed the headline color to ${color}.`;
      } else {
        explanation = "❌ Could not find the headline.";
      }
    }
    
    // COMMAND 8: Keep product large (do nothing special)
    else if (msgLower.includes('keep product') && msgLower.includes('large')) {
      explanation = "✅ I'll keep the product image large as requested.";
    }
    
    // COMMAND 9: Center product
    else if (msgLower.includes('center') && msgLower.includes('product')) {
      const result = findNodeByRole(updatedLayout, 'product');
      if (result) {
        updatedLayout = moveNode(updatedLayout, result.id, 'center');
        explanation = "✅ I've centered the product image.";
      } else {
        explanation = "❌ Could not find the product image.";
      }
    }
    
    // COMMAND 10: Follow-up with "it" (last modified tracking)
    else if (msgLower.includes('make it') || (msgLower.includes('it') && (msgLower.includes('smaller') || msgLower.includes('bigger')))) {
      // Find last modified from history
      let lastElement = null;
      for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].role === 'user') {
          const histMsg = history[i].content.toLowerCase();
          if (histMsg.includes('headline')) lastElement = 'headline';
          else if (histMsg.includes('offer')) lastElement = 'offer';
          else if (histMsg.includes('product')) lastElement = 'product';
          if (lastElement) break;
        }
      }
      
      if (lastElement) {
        const result = findNodeByRole(updatedLayout, lastElement);
        if (result) {
          const scale = msgLower.includes('smaller') ? 0.8 : 1.2;
          updatedLayout = resizeText(updatedLayout, result.id, scale);
          explanation = `✅ I've made the ${lastElement} ${msgLower.includes('smaller') ? 'smaller' : 'bigger'}.`;
        }
      } else {
        explanation = "❌ I'm not sure which element you're referring to. Please specify (e.g., 'make headline smaller').";
      }
    }
    
    // DEFAULT: Use LLM for complex commands
    else {
      usedLLM = true;
      try {
        const llmResult = await getLayoutUpdate(message, layout, history || []);
        updatedLayout = llmResult.updatedLayout;
        explanation = llmResult.explanation;
      } catch (llmError) {
        console.error('LLM Error:', llmError);
        explanation = "⚠️ I couldn't process that request. Please try something like: 'Convert to 9:16', 'Make headline smaller', or 'Move offer badge higher'.";
      }
    }
    
    res.json({ 
      updatedLayout, 
      explanation,
      success: true,
      usedLLM
    });
    
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ 
      error: 'Failed to process request',
      explanation: '❌ Sorry, something went wrong. Please try again.',
      success: false
    });
  }
});

export default router;