import { Lead, Business } from '../types/database';

/**
 * Generates a personalized follow-up message draft for a lead.
 */
export function generateFollowUpMessage(lead: Lead, business?: Business | null): string {
  const firstName = lead.full_name.split(' ')[0] || lead.full_name;
  const businessName = business?.business_name ? business.business_name : 'our team';

  let greeting = `Hi ${firstName},`;

  let stageContext = '';
  switch (lead.stage) {
    case 'New':
      stageContext = `Thanks for reaching out to ${businessName}. I wanted to quickly follow up and see how we can assist you with your requirements.`;
      break;
    case 'Contacted':
      stageContext = `Following up on our recent conversation regarding ${businessName}. Do you have a few minutes to connect today?`;
      break;
    case 'Interested':
      stageContext = `I hope you're having a great week! I'm checking in regarding your interest with ${businessName}. Let me know if you have any questions.`;
      break;
    case 'Negotiating':
      stageContext = `Checking in to see if you've had a chance to review our proposal from ${businessName}. I'd love to address any questions you might have.`;
      break;
    case 'Closed Won':
      stageContext = `Hope all is well! I wanted to check in and see how everything is going so far with ${businessName}.`;
      break;
    case 'Closed Lost':
      stageContext = `Hope you're doing well. It's been a while since we last spoke at ${businessName}, and I wanted to see if your timeline or needs have changed.`;
      break;
    default:
      stageContext = `I wanted to follow up regarding your inquiry with ${businessName}.`;
  }

  let noteContext = '';
  if (lead.notes && lead.notes.trim()) {
    noteContext = `\n\nRegarding your note: "${lead.notes.trim()}"`;
  }

  const closing = `\n\nBest regards,\n${businessName}`;

  return `${greeting}\n\n${stageContext}${noteContext}${closing}`;
}
