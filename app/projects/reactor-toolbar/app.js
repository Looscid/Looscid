(() => {
  'use strict';
  const reactions = [
    {emoji:'✨', name:'Sparkle reaction'}, {emoji:'😂', name:'Laughing reaction'}, {emoji:'🔥', name:'Fire reaction'},
    {emoji:'👏', name:'Applause reaction'}, {emoji:'💡', name:'Bright idea reaction'}, {emoji:'🎉', name:'Celebration reaction'},
    {emoji:'🤔', name:'Thinking reaction'}, {emoji:'❤️', name:'Heart reaction'}, {emoji:'🚀', name:'Launch reaction'}
  ];
  const total = 2931; let index = 0; const selected = [];
  const $ = (id) => document.getElementById(id);
  const grid = $('reaction-grid'), preview = $('preview'), live = $('live');
  function announce(text){ live.textContent=''; window.setTimeout(() => { live.textContent=text; }, 20); }
  function render(){
    const item = reactions[index]; $('reaction-name').textContent=item.name; $('reaction-count').textContent=`Reaction ${index+1} of ${total}`;
    preview.querySelector('.emoji').textContent=item.emoji;
    [...grid.children].forEach((button,i)=>button.setAttribute('aria-selected', String(i===index)));
  }
  function move(delta){ index=(index+delta+reactions.length)%reactions.length; render(); announce(`${reactions[index].name}, preview ${index+1} of ${total}`); }
  reactions.forEach((item,i)=>{ const button=document.createElement('button'); button.type='button'; button.className='reaction'; button.setAttribute('role','option'); button.setAttribute('aria-selected',i===0); button.tabIndex=i===0?0:-1; button.innerHTML=`<span class="emoji" aria-hidden="true">${item.emoji}</span>${item.name}`; button.addEventListener('click',()=>{index=i;render();select();}); button.addEventListener('keydown',(e)=>{if(e.key==='ArrowRight'||e.key==='ArrowDown'){e.preventDefault();move(1);grid.children[index].focus();}if(e.key==='ArrowLeft'||e.key==='ArrowUp'){e.preventDefault();move(-1);grid.children[index].focus();}if(e.key==='Home'){e.preventDefault();index=0;render();grid.children[0].focus();}if(e.key==='End'){e.preventDefault();index=reactions.length-1;render();grid.children[index].focus();}}); grid.append(button); });
  function select(){ const item=reactions[index]; selected.push(item); const list=$('selected-list'); if(selected.length===1) list.textContent=''; const li=document.createElement('li'); li.textContent=`${item.emoji} ${item.name}`; list.append(li); announce(`${item.name} selected. ${selected.length} selected.`); }
  $('previous').addEventListener('click',()=>move(-1)); $('next').addEventListener('click',()=>move(1)); $('send').addEventListener('click',select); $('clear').addEventListener('click',()=>{selected.length=0;$('selected-list').innerHTML='<li class="empty">Nothing selected yet.</li>';announce('Selections cleared');}); $('add').addEventListener('click',()=>announce('Media picker is a prototype placeholder.')); preview.addEventListener('keydown',(e)=>{if(e.key==='ArrowLeft'){e.preventDefault();move(-1)}if(e.key==='ArrowRight'){e.preventDefault();move(1)}if(e.key==='Enter'||e.key===' '){e.preventDefault();select()}}); render();
})();
