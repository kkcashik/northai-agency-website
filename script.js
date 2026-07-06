(function(){
  "use strict";

  /* ===== Nav scroll background ===== */
  var nav=document.getElementById('nav');
  function onScroll(){ nav.classList.toggle('scrolled', window.scrollY>80); }
  onScroll(); window.addEventListener('scroll',onScroll,{passive:true});

  /* ===== Mobile menu ===== */
  var burger=document.getElementById('hamburger'), menu=document.getElementById('mobileMenu');
  burger.addEventListener('click',function(){
    var open=menu.classList.toggle('open');
    burger.classList.toggle('open',open);
    burger.setAttribute('aria-expanded',open);
  });
  menu.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click',function(){ menu.classList.remove('open'); burger.classList.remove('open'); burger.setAttribute('aria-expanded','false'); });
  });

  /* ===== Scroll reveals (staggered via per-element transition-delay) ===== */
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  },{threshold:.14, rootMargin:"0px 0px -40px 0px"});
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });

  /* ===== Animated counters ===== */
  function animateCount(el){
    var target=parseFloat(el.getAttribute('data-count')), dur=1500, start=null;
    function frame(t){
      if(!start) start=t;
      var p=Math.min((t-start)/dur,1);
      var eased=1-Math.pow(1-p,3); // easeOutCubic
      el.textContent=Math.round(eased*target);
      if(p<1) requestAnimationFrame(frame);
      else el.textContent=target;
    }
    requestAnimationFrame(frame);
  }
  var counters=document.querySelectorAll('[data-count]');
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce){ counters.forEach(function(c){ c.textContent=c.getAttribute('data-count'); }); }
  else { counters.forEach(function(c){ animateCount(c); }); }

  /* ===== FAQ accordion ===== */
  document.querySelectorAll('.q').forEach(function(q){
    var btn=q.querySelector('.q-btn'), body=q.querySelector('.q-body');
    btn.addEventListener('click',function(){
      var open=q.classList.toggle('open');
      btn.setAttribute('aria-expanded',open);
      body.style.maxHeight = open ? body.scrollHeight+'px' : '0px';
    });
  });

  /* ===== Demo form → GHL Inbound Webhook ===== */
  var GHL_WEBHOOK_URL = "https://services.leadconnectorhq.com/hooks/iuQtTC39dqAU6qwodkSq/webhook-trigger/b8f4b7de-08e4-4d5e-91d2-53ec38da9a38";

  var form=document.getElementById('demoForm'), ok=document.getElementById('formOk');
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var name=document.getElementById('leadName'),
        clinic=document.getElementById('leadClinic'),
        email=document.getElementById('email'),
        phone=document.getElementById('leadPhone');
    if(name && !name.value.trim()){ name.focus(); return; }
    if(!email.value || !email.checkValidity()){ email.focus(); return; }

    var payload={
      name: name ? name.value.trim() : "",
      clinic: clinic ? clinic.value.trim() : "",
      email: email.value,
      phone: phone ? phone.value.trim() : "",
      source: "NorthAI website",
      page: location.href,
      submitted_at: new Date().toISOString()
    };

    form.style.display='none';
    ok.classList.add('show');

    if(GHL_WEBHOOK_URL.indexOf('http')===0){
      fetch(GHL_WEBHOOK_URL,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(payload)
      }).catch(function(){ /* fails silently */ });
    }
  });

  /* ===== ROI calculator ===== */
  var roiCalls=document.getElementById('roiCalls'),
      roiMissed=document.getElementById('roiMissed'),
      roiValue=document.getElementById('roiValue'),
      roiLost=document.getElementById('roiLost'),
      roiRecovered=document.getElementById('roiRecovered');

  function fmt(n){ return Math.round(n).toLocaleString('en-US'); }
  var RECOVERY_RATE=0.73; // NorthAI converts ~73% of missed calls

  function calcRoi(){
    if(!roiCalls) return;
    var calls=parseFloat(roiCalls.value)||0,
        missed=Math.min(parseFloat(roiMissed.value)||0,100),
        value=parseFloat(roiValue.value)||0;
    var lost=calls*(missed/100)*value;
    roiLost.textContent=fmt(lost);
    roiRecovered.textContent='$'+fmt(lost*RECOVERY_RATE)+'/mo';
  }
  if(roiCalls){
    [roiCalls,roiMissed,roiValue].forEach(function(el){
      el.addEventListener('input',calcRoi);
    });
    calcRoi();
  }

  /* ===== Hero call demo playback ===== */
  var ccPlay=document.getElementById('ccPlay'),
      ccWave=document.getElementById('ccWave'),
      ccTime=document.getElementById('ccTime'),
      ccStatusText=document.getElementById('ccStatusText'),
      ccPlayLabel=document.getElementById('ccPlayLabel'),
      ccMsgs=document.querySelectorAll('#callDemo .cc-msg');

  if(ccPlay){
    var ccTimers=[], ccTicker=null;

    function ccReset(){
      ccTimers.forEach(clearTimeout); ccTimers=[];
      if(ccTicker) clearInterval(ccTicker);
      ccMsgs.forEach(function(m){ m.classList.remove('show'); });
      ccWave.classList.add('paused');
      ccTime.textContent='00:00';
    }

    ccPlay.addEventListener('click',function(){
      ccReset();
      ccPlay.classList.add('hidden');
      ccStatusText.textContent='Live · answering now';
      ccWave.classList.remove('paused');

      // call timer
      var secs=0;
      ccTicker=setInterval(function(){
        secs++;
        ccTime.textContent='00:'+(secs<10?'0':'')+secs;
        if(secs>=42){
          clearInterval(ccTicker);
          ccWave.classList.add('paused');
          ccStatusText.textContent='Call complete · patient booked';
          ccPlayLabel.textContent='Replay the call';
          ccPlay.classList.remove('hidden');
        }
      },160); // compressed time so the demo plays in ~7s

      // transcript reveals: 4 messages, then 3 status tags
      var schedule=[600,2100,3600,5100,6200,6500,6800];
      ccMsgs.forEach(function(m,i){
        ccTimers.push(setTimeout(function(){ m.classList.add('show'); },schedule[i]||6800));
      });
    });
  }

  /* ===== Theme toggle (dark / light) ===== */
  var themeBtn=document.getElementById('themeToggle');
  var THEME_KEY='northai-theme';
  function applyTheme(t){
    document.body.classList.toggle('light', t==='light');
    if(themeBtn){
      var lbl=themeBtn.querySelector('.tt-label');
      if(lbl) lbl.textContent = (t==='light') ? 'Dark' : 'Light';
    }
  }
  try{ applyTheme(localStorage.getItem(THEME_KEY)||'light'); }catch(e){}
  if(themeBtn){
    themeBtn.addEventListener('click',function(){
      var next = document.body.classList.contains('light') ? 'dark' : 'light';
      applyTheme(next);
      try{ localStorage.setItem(THEME_KEY,next); }catch(e){}
    });
  }
})();
