
const NEWS_KEY = "sawtZannouchNews";
const defaultNews = [
  {
    id: 1,
    title: "زانوش... مدينة تتنفس الحياة",
    category: "زانوش",
    date: "26 سبتمبر 2026",
    image: "zannouch-01.png",
    excerpt: "صور من شوارع زانوش وملامح الحياة اليومية في المدينة.",
    content: "نستعرض في هذا المقال صوراً من زانوش، شوارعها، أحيائها ومشاهد من الحياة اليومية. هذا النص قابل للتعديل من لوحة الإدارة."
  },
  {
    id: 2,
    title: "صور من قلب زانوش",
    category: "صور",
    date: "26 سبتمبر 2026",
    image: "zannouch-03.png",
    excerpt: "جولة بصرية في عدد من شوارع المدينة.",
    content: "جولة مصورة في عدد من شوارع زانوش، ضمن نافذة صوت زانوش على الحياة المحلية."
  },
  {
    id: 3,
    title: "قصر البلدية في زانوش",
    category: "مجتمع",
    date: "26 سبتمبر 2026",
    image: "zannouch-09.png",
    excerpt: "لقطة من مقر البلدية في المدينة.",
    content: "صورة من أمام مقر البلدية في زانوش. يمكن استبدال هذا المحتوى بخبر موثق عند النشر."
  }
];

function getNews() {
  try {
    const saved = JSON.parse(localStorage.getItem(NEWS_KEY));
    return Array.isArray(saved) && saved.length ? saved : defaultNews;
  } catch { return defaultNews; }
}
function saveNews(items) { localStorage.setItem(NEWS_KEY, JSON.stringify(items)); }

function setupMenu() {
  const btn = document.querySelector("[data-menu]");
  const nav = document.querySelector("[data-nav]");
  if (!btn || !nav) return;
  btn.addEventListener("click", () => nav.classList.toggle("open"));
}
function setupYear() {
  document.querySelectorAll("[data-year]").forEach(x => x.textContent = new Date().getFullYear());
}
function renderNews(target, limit = 0) {
  const el = document.querySelector(target);
  if (!el) return;
  let items = getNews();
  if (limit) items = items.slice(0, limit);
  el.innerHTML = items.map(n => `
    <article class="news-card">
      <a href="article.html?id=${n.id}" class="news-image"><img src="${n.image}" alt="${escapeHtml(n.title)}" loading="lazy"></a>
      <div class="news-body">
        <span class="tag">${escapeHtml(n.category)}</span>
        <h3><a href="article.html?id=${n.id}">${escapeHtml(n.title)}</a></h3>
        <p>${escapeHtml(n.excerpt)}</p>
        <div class="meta">${escapeHtml(n.date)} <span>•</span> صوت زانوش</div>
      </div>
    </article>`).join("");
}
function renderArticle() {
  const box = document.querySelector("#article");
  if (!box) return;
  const id = new URLSearchParams(location.search).get("id");
  const n = getNews().find(x => String(x.id) === String(id)) || getNews()[0];
  box.innerHTML = `
    <div class="article-head"><span class="tag">${escapeHtml(n.category)}</span>
    <h1>${escapeHtml(n.title)}</h1><div class="meta">${escapeHtml(n.date)} • صوت زانوش</div></div>
    <img class="article-cover" src="${n.image}" alt="${escapeHtml(n.title)}">
    <div class="article-content"><p>${escapeHtml(n.content)}</p></div>`;
}
function setupSearch() {
  const input = document.querySelector("[data-search]");
  const list = document.querySelector("[data-search-results]");
  if (!input || !list) return;
  const run = () => {
    const q = input.value.trim().toLowerCase();
    const items = getNews().filter(n => `${n.title} ${n.category} ${n.excerpt}`.toLowerCase().includes(q));
    list.innerHTML = items.map(n => `
      <a class="search-result" href="article.html?id=${n.id}">
        <img src="${n.image}" alt="">
        <span><b>${escapeHtml(n.title)}</b><small>${escapeHtml(n.category)} • ${escapeHtml(n.date)}</small></span>
      </a>`).join("") || `<p class="empty">لا توجد نتائج مطابقة.</p>`;
  };
  input.addEventListener("input", run); run();
}
function setupAdmin() {
  const form = document.querySelector("#newsForm");
  const list = document.querySelector("#adminList");
  if (!form || !list) return;
  const render = () => {
    const items = getNews();
    list.innerHTML = items.map(n => `
      <div class="admin-row"><div><b>${escapeHtml(n.title)}</b><small>${escapeHtml(n.category)} • ${escapeHtml(n.date)}</small></div>
      <button class="btn danger" data-delete="${n.id}">حذف</button></div>`).join("");
    list.querySelectorAll("[data-delete]").forEach(b => b.onclick = () => {
      saveNews(getNews().filter(n => String(n.id) !== String(b.dataset.delete))); render();
    });
  };
  form.addEventListener("submit", e => {
    e.preventDefault();
    const data = new FormData(form);
    const item = {
      id: Date.now(),
      title: data.get("title"), category: data.get("category"), date: data.get("date") || new Date().toLocaleDateString("ar-TN"),
      image: data.get("image") || "zannouch-01.png",
      excerpt: data.get("excerpt"), content: data.get("content")
    };
    saveNews([item, ...getNews()]); form.reset(); render();
    alert("تمت إضافة الخبر على هذا الجهاز.");
  });
  render();
}
function escapeHtml(s="") {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
document.addEventListener("DOMContentLoaded", () => {
  setupMenu(); setupYear(); renderNews("#latestNews", 6); renderNews("#allNews"); renderArticle(); setupSearch(); setupAdmin();
});

// Supabase dynamic news: إذا تم إعداد Supabase، تُعرض المنشورات المنشورة من قاعدة البيانات.
async function renderSupabaseNews(){
  if(!window.SAWT_DB) return;
  try{
    const items=await cmsNews();
    const card=n=>`<article class="news-card"><a href="article.html?id=${n.id}" class="news-image"><img src="${n.cover_url||'zannouch-01.png'}" alt="${esc(n.title)}" loading="lazy"></a><div class="news-body"><span class="tag">${esc(n.category||'أخبار')}</span><h3><a href="article.html?id=${n.id}">${esc(n.title)}</a></h3><p>${esc(n.excerpt||'')}</p><div class="meta">${n.published_at?new Date(n.published_at).toLocaleDateString('ar-TN'):''} • صوت زانوش</div></div></article>`;
    const all=document.querySelector('#allNews');
    if(all) all.innerHTML=items.map(card).join('') || '<p class="empty">لا توجد منشورات منشورة بعد.</p>';
    const latest=document.querySelector('#latestNews');
    if(latest) latest.innerHTML=items.slice(0,6).map(card).join('') || '<p class="empty">لا توجد منشورات منشورة بعد.</p>';
  }catch(e){console.warn(e)}
}
async function renderSupabaseArticle(){
 const box=document.querySelector('#article'); if(!box||!window.SAWT_DB)return; const id=new URLSearchParams(location.search).get('id'); if(!id)return;
 try{const n=await cmsPost(id); if(!n)return; const imgs=(n.media||[]).filter(x=>x.type==='image').map(x=>`<img class="article-cover" src="${x.url}" alt="${esc(x.title||n.title)}">`).join(''); box.innerHTML=`<div class="article-head"><span class="tag">${esc(n.category||'أخبار')}</span><h1>${esc(n.title)}</h1><div class="meta">${n.published_at?new Date(n.published_at).toLocaleDateString('ar-TN'):''} • صوت زانوش</div></div>${imgs||''}<div class="article-content"><p>${esc(n.content).replace(/\n/g,'</p><p>')}</p></div>`}catch(e){console.warn(e)}
}
document.addEventListener('DOMContentLoaded',()=>{renderSupabaseNews();renderSupabaseArticle()});
