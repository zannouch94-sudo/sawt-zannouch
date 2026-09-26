const ready = (() => {
  const c = window.SAWT_CONFIG || {};
  if (!c.SUPABASE_URL || c.SUPABASE_URL.includes('ضع-') || !c.SUPABASE_ANON_KEY || c.SUPABASE_ANON_KEY.includes('ضع-')) return null;
  return supabase.createClient(c.SUPABASE_URL, c.SUPABASE_ANON_KEY);
})();
window.SAWT_DB = ready;
function cmsConfigured(){ return !!ready; }
async function cmsNews(limit=0){
  if(!ready) return [];
  let q=ready.from('posts').select('*').eq('status','published').order('published_at',{ascending:false});
  if(limit) q=q.limit(limit);
  const {data,error}=await q; if(error) throw error; return data||[];
}
async function cmsPost(id){
  if(!ready) return null;
  const {data,error}=await ready.from('posts').select('*,media(*)').eq('id',id).maybeSingle(); if(error) throw error; return data;
}
function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
