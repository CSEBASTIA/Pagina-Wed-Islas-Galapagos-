(function(){
function esc(s){return String(s??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function stars(n){const x=Math.max(0,Math.min(5,Number(n)||0));return `<span class="blog-review-stars">${'★'.repeat(x)}${'☆'.repeat(5-x)}</span>`;}
function matchReview(r,t){const a=String(r.tour_name||'').toLowerCase().replace(/^tour\s+/,'').trim();const b=String(t.title||'').toLowerCase().replace(/^tour\s+/,'').trim();return (r.tour_id!=null && Number(r.tour_id)===Number(t.id)) || (a && b && (a===b||a.includes(b)||b.includes(a)));}
function initReveal(){const nodes=document.querySelectorAll('[data-blog-reveal]');if(!nodes.length)return;if(!('IntersectionObserver'in window)){nodes.forEach(n=>n.classList.add('blog-reveal-visible'));return;}const io=new IntersectionObserver((entries,obs)=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('blog-reveal-visible');obs.unobserve(e.target);}}),{threshold:.08});nodes.forEach(n=>io.observe(n));}
window.BlogUI={
async mount(){
  const root=document.getElementById('blog-tours-root');
  const all=document.getElementById('blog-general-reviews');
  const err=document.getElementById('blog-load-error');
  if(!root)return;
  try{
    // ── Carga en PARALELO (era secuencial → lento) ──────────────────
    const [tours, reviews] = await Promise.all([
      typeof ToursService!=='undefined' ? ToursService.getAllTours() : Promise.resolve([]),
      typeof ReviewsService!=='undefined' ? ReviewsService.getAll().catch(()=>[]) : Promise.resolve([]),
    ]);

    root.innerHTML=(tours||[]).map((t,i)=>{const revs=(reviews||[]).filter(r=>matchReview(r,t));return `<article data-blog-reveal class="blog-scroll-reveal bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100 flex flex-col ${i%2?'md:flex-row-reverse':'md:flex-row'} gap-8"><div class="flex-1"><img src="${esc(t.image)}" alt="${esc(t.title)}" class="w-full h-[260px] md:h-[340px] object-cover rounded-2xl" loading="lazy" onerror="this.src='https://placehold.co/900x500/f1f5f9/64748b?text=Tour'"></div><div class="flex-1"><h2 class="text-3xl font-bold text-gray-900 mb-3">${esc(t.title)}</h2><p class="text-gray-600 mb-4">${esc(t.description||'')}</p><h3 class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Reseñas de viajeros</h3>${revs.length?`<ul class="space-y-3">${revs.map(r=>`<li class="blog-review-item rounded-xl border border-gray-200 bg-gray-50/90 px-4 py-3"><div class="flex items-center gap-2 mb-1">${stars(r.rating)}<span class="text-gray-900 text-sm font-semibold">${esc(r.customer_name)}</span></div>${r.comment?`<p class="text-gray-600 text-sm">${esc(r.comment)}</p>`:''}</li>`).join('')}</ul>`:`<p class="text-gray-500 text-sm italic">Aún no hay reseñas para este tour.</p>`}</div></article>`;}).join('')||'<p class="text-center text-gray-600 py-16">No hay tours para mostrar.</p>';

    all.innerHTML=(reviews||[]).length?`<div class="grid grid-cols-1 md:grid-cols-2 gap-5">${reviews.slice(0,12).map(r=>`<article data-blog-reveal class="blog-scroll-reveal bg-white p-5 rounded-2xl border border-gray-100 shadow-md"><div class="flex items-center gap-2 mb-2">${stars(r.rating)}<span class="text-gray-900 font-semibold">${esc(r.customer_name)}</span></div><p class="text-cyan-600 text-xs font-semibold mb-2">${esc(r.tour_name||'')}</p>${r.comment?`<p class="text-gray-600 text-sm">${esc(r.comment)}</p>`:''}</article>`).join('')}</div>`:'<p class="text-gray-500 text-center">Cuando lleguen las primeras reseñas, aparecerán aquí.</p>';

    if(window.lucide)lucide.createIcons();initReveal();
  }catch(e){if(err){err.textContent='No se pudieron cargar datos del blog.';err.classList.remove('hidden');}}
}
};
})();
