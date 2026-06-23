import { UserProfile } from '../types';

export function buildProfileContext(profile: UserProfile): string {
  if (!profile) return 'Writing on behalf of a content creator.';
  
  const goals = profile.postingGoals && profile.postingGoals.length > 0 
    ? profile.postingGoals.join(', ') 
    : 'None specified';
  const formats = profile.contentFormats && profile.contentFormats.length > 0 
    ? profile.contentFormats.join(', ') 
    : 'None specified';

  const locationContext = profile.geolocation 
    ? `They are based in: "${profile.geolocation}". Align all references, colloquialisms, cultural angles, and topics to appeal to the local population in "${profile.geolocation}".` 
    : 'They are based globally.';

  return `You are writing on behalf of ${profile.name || 'a creator'}, a ${profile.profession || 'professional'} operating in the ${profile.niche || 'specific'} space.
${locationContext}
Their content vision: ${profile.contentVision || 'None specified'}
Their tone: ${profile.tone || 'Friendly and professional'}
Their goals: ${goals}
Their preferred formats: ${formats}
Their primary platform: ${profile.primaryPlatform || 'All platforms'}

CRITICAL FORMATTING AND STYLE INSTRUCTIONS:
1. MAKE THE ENGLISH SIMPLIFIED: Communicate purely in simple, plain, conversational, and direct English. Do NOT use heavy terminology, technical jargon, corporate buzzwords, or complex phrasing. Choose small, clear words that anyone can instantly understand.
2. REMOVE ALL ASTERISKS (*) AND EM DASHES (— or --): You are strictly forbidden from outputting the asterisk character (*) or the em dash / double hyphen characters (— or --) in any text or message body of the generated response. Replace dashes representing dividers with a simple comma, space, or standard short hyphen, and do not bold items using double asterisks. Keep paragraph breaks and structure natural and exceptionally clean.`;
}

export const JSON_FORCE_INSTRUCTION = `Respond ONLY with a valid JSON object or array. No markdown fences, no explanation, no preamble. Your entire response must be directly parseable by JSON.parse().`;
