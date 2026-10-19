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

  /* ===== Animated counters — fire when scrolled into view ===== */
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function countText(el,value){
    var pre=el.getAttribute('data-prefix')||'', suf=el.getAttribute('data-suffix')||'';
    return pre+value.toLocaleString('en-US')+suf;
  }
  function setFinal(el){
    el.textContent=countText(el,parseFloat(el.getAttribute('data-count'))||0);
  }
  function animateCount(el){
    var target=parseFloat(el.getAttribute('data-count'))||0, dur=1400, start=null;
    function frame(t){
      if(!start) start=t;
      var p=Math.min((t-start)/dur,1);
      var eased=1-Math.pow(1-p,3); // easeOutCubic
      el.textContent=countText(el,Math.round(eased*target));
      if(p<1) requestAnimationFrame(frame);
      else setFinal(el);
    }
    requestAnimationFrame(frame);
  }

  var counters=document.querySelectorAll('[data-count]'), cio=null;
  if(reduce){ counters.forEach(setFinal); }
  else{
    cio=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ animateCount(e.target); cio.unobserve(e.target); }
      });
    },{threshold:.4});
    counters.forEach(function(c){ cio.observe(c); });
  }

  /* ===== Case study tabs ===== */
  var caseTabs=document.querySelectorAll('.case-tab'),
      casePanels=document.querySelectorAll('.case-panel');

  caseTabs.forEach(function(tab){
    tab.addEventListener('click',function(){
      var idx=tab.getAttribute('data-case');
      caseTabs.forEach(function(t){
        var on=(t===tab);
        t.classList.toggle('active',on);
        t.setAttribute('aria-selected',on);
      });
      casePanels.forEach(function(p){
        var on=(p.getAttribute('data-panel')===idx);
        p.classList.toggle('active',on);
        p.hidden=!on;
      });
      // replay the headline number each time a panel is revealed
      var num=document.querySelector('.case-panel.active [data-count]');
      if(num){
        if(cio) cio.unobserve(num);
        if(reduce) setFinal(num); else animateCount(num);
      }
    });
  });

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

  /* ===== Hero call demo playback (two scenarios, one continuous recording each) ===== */
  var ccPlay=document.getElementById('ccPlay'),
      ccWave=document.getElementById('ccWave'),
      ccTime=document.getElementById('ccTime'),
      ccStatusText=document.getElementById('ccStatusText'),
      ccPlayLabel=document.getElementById('ccPlayLabel'),
      ccTranscript=document.getElementById('ccTranscript'),
      ccFoot=document.getElementById('ccFoot'),
      ccTabs=document.querySelectorAll('.cc-tab');

  /* `at` = second in the recording where each line starts.
     Leave null to spread lines automatically by text length. */
  var CC_SCENARIOS={
    cdcp:{
      audio:'audio/scenario-cdcp.mp3?v=1',
      status:'Incoming call · Saturday 9:04 PM',
      done:'Call complete · patient booked',
      tags:['✓ CDCP checked','✓ Appointment booked','✓ Confirmation texted'],
      lines:[
        {us:1,at:null,t:'Hi, thanks for calling Maple Dental, this is the after-hours assistant. How can I help?'},
        {us:0,at:null,t:'Oh hi! Um, do you guys take the CDCP? The government dental plan?'},
        {us:1,at:null,t:'We do, yes. We bill CDCP directly. Are you already enrolled — do you have your member ID?'},
        {us:0,at:null,t:'Yeah, I got the letter last month.'},
        {us:1,at:null,t:'Perfect. A check-up and cleaning is covered — depending on your income there might be a small co-pay, and we’ll confirm that before anything’s done. I’ve got Saturday at 10:30, does that work?'},
        {us:0,at:null,t:'Oh, that’s great. Yeah, 10:30 works.'},
        {us:1,at:null,t:'Lovely. Can I get your full name?'},
        {us:0,at:null,t:'Maria Santos.'},
        {us:1,at:null,t:'Thanks, Maria. You’re booked for Saturday, 10:30. I’m texting you a confirmation now — just bring your CDCP member ID. Anything else?'},
        {us:0,at:null,t:'No, that’s it. Thank you so much!'},
        {us:1,at:null,t:'You’re welcome. Have a good night!'}
      ]
    },
    emergency:{
      audio:'audio/scenario-emergency.mp3?v=1',
      status:'Incoming call · Sunday 11:40 PM',
      done:'Call complete · emergency slot booked',
      tags:['✓ Triage done','✓ Emergency slot booked','✓ Details texted'],
      lines:[
        {us:1,at:null,t:'Hi, Maple Dental after-hours line. How can I help you tonight?'},
        {us:0,at:null,t:'Hi… yeah, I’ve got really bad tooth pain. Started this afternoon, and it’s getting worse.'},
        {us:1,at:null,t:'I’m sorry, that sounds rough. Quick question so I can help — any swelling in your face, fever, or trouble swallowing or breathing?'},
        {us:0,at:null,t:'No, no swelling. It just really throbs.'},
        {us:1,at:null,t:'Okay, good. I’m booking you our first emergency spot tomorrow — Monday at 8:15. The dentist will see you first thing.'},
        {us:0,at:null,t:'Okay. Thank you.'},
        {us:1,at:null,t:'Until then, a cold compress on your cheek can help. And if any swelling, fever, or trouble breathing starts, please go to the ER right away. Can I get your name?'},
        {us:0,at:null,t:'Daniel Cho.'},
        {us:1,at:null,t:'Got it, Daniel. You’re booked for 8:15 tomorrow — I’m texting you the details now. Hope you feel better.'}
      ]
    }
  };

  if(ccPlay && ccTranscript){
    var ccTimers=[], ccTicker=null, ccPlaying=false, ccScn='cdcp';
    var ccLines=[], ccTags=[], ccClip=null, ccShown=-1;

    /* Only the latest 2 lines stay visible, so the card never grows */
    var CC_VISIBLE=2;

    function ccFmt(sec){ sec=Math.floor(sec); var m=Math.floor(sec/60), r=sec%60; return (m<10?'0':'')+m+':'+(r<10?'0':'')+r; }

    function ccBuild(){
      var s=CC_SCENARIOS[ccScn];
      ccTranscript.innerHTML=''; ccFoot.innerHTML='';
      ccLines=s.lines.map(function(l){
        var p=document.createElement('p');
        p.className=(l.us?'cc-us':'cc-them')+' cc-msg';
        p.textContent='“'+l.t+'”';
        ccTranscript.appendChild(p);
        return p;
      });
      ccTags=s.tags.map(function(t){
        var sp=document.createElement('span');
        sp.className='cc-tag cc-msg';
        sp.textContent=t;
        ccFoot.appendChild(sp);
        return sp;
      });
      ccStatusText.textContent=s.status;
      ccPlayLabel.textContent='Hear NorthAI take this call';
    }

    function ccStopAudio(){
      if(ccClip){ try{ ccClip.onended=null; ccClip.ontimeupdate=null; ccClip.pause(); }catch(e){} ccClip=null; }
    }

    function ccReset(){
      ccTimers.forEach(clearTimeout); ccTimers=[];
      if(ccTicker) clearInterval(ccTicker);
      ccStopAudio();
      ccLines.forEach(function(m){ m.classList.remove('show'); });
      ccTags.forEach(function(m){ m.classList.remove('show'); });
      ccWave.classList.add('paused');
      ccTime.textContent='00:00';
      ccShown=-1;
      ccPlaying=false;
    }

    function ccShowLine(i){
      if(i<=ccShown) return;
      for(var k=ccShown+1;k<=i;k++) ccLines[k].classList.add('show');
      ccShown=i;
      ccLines.forEach(function(el,k){ if(k<=i-CC_VISIBLE) el.classList.remove('show'); });
    }

    /* Start time (s) of each line: explicit `at`, else proportional to text length */
    function ccCues(duration){
      var lines=CC_SCENARIOS[ccScn].lines;
      var total=lines.reduce(function(a,l){ return a+l.t.length; },0), acc=0;
      return lines.map(function(l){
        var c=(l.at!=null)?l.at:duration*acc/total;
        acc+=l.t.length;
        return c;
      });
    }

    function ccFinish(){
      if(ccTicker) clearInterval(ccTicker);
      ccWave.classList.add('paused');
      ccShowLine(ccLines.length-1);
      ccTags.forEach(function(t,i){
        ccTimers.push(setTimeout(function(){ t.classList.add('show'); }, 250+i*320));
      });
      ccStatusText.textContent=CC_SCENARIOS[ccScn].done;
      ccPlayLabel.textContent='Replay the call';
      ccPlay.classList.remove('hidden');
      ccPlaying=false;
      // invite popup after the tags land
      ccTimers.push(setTimeout(ccShowModal,1400));
    }

    /* ===== Post-call popup ===== */
    var ccModal=document.getElementById('ccModal');
    function ccShowModal(){ if(ccModal){ ccModal.hidden=false; } }
    function ccHideModal(){ if(ccModal){ ccModal.hidden=true; } }
    if(ccModal){
      ccModal.querySelectorAll('[data-close]').forEach(function(b){
        b.addEventListener('click',ccHideModal);
      });
      document.addEventListener('keydown',function(e){ if(e.key==='Escape') ccHideModal(); });
    }

    /* No audio available: reveal lines on a reading-pace timer instead */
    function ccSilentRun(i){
      if(!ccPlaying) return;
      if(i>=ccLines.length){ ccFinish(); return; }
      ccShowLine(i);
      var len=CC_SCENARIOS[ccScn].lines[i].t.length;
      ccTimers.push(setTimeout(function(){ ccSilentRun(i+1); }, Math.max(1600, len*45)));
    }

    ccTabs.forEach(function(tab){
      tab.addEventListener('click',function(){
        if(tab.dataset.scn===ccScn && !ccPlaying) return;
        ccReset();
        ccScn=tab.dataset.scn;
        ccTabs.forEach(function(t){
          var on=(t===tab);
          t.classList.toggle('active',on);
          t.setAttribute('aria-selected',on?'true':'false');
        });
        ccPlay.classList.remove('hidden');
        ccBuild();
      });
    });

    ccPlay.addEventListener('click',function(){
      ccReset();
      ccPlaying=true;
      ccPlay.classList.add('hidden');
      ccStatusText.textContent='Live · answering now';
      ccWave.classList.remove('paused');

      // a fresh Audio object per playback (reusing one element made sound flaky)
      var clip=new Audio(CC_SCENARIOS[ccScn].audio);
      ccClip=clip;
      var cues=null;
      clip.ontimeupdate=function(){
        if(!ccPlaying) return;
        if(!cues && isFinite(clip.duration)) cues=ccCues(clip.duration);
        var t=clip.currentTime;
        ccTime.textContent=ccFmt(t);
        if(cues){ for(var i=cues.length-1;i>=0;i--){ if(t>=cues[i]){ ccShowLine(i); break; } } }
      };
      clip.onended=function(){ if(ccPlaying) ccFinish(); };
      var p=clip.play(); // must fire inside the click gesture
      if(p && p.catch){
        p.catch(function(){
          if(!ccPlaying) return;
          var secs=0;
          ccTicker=setInterval(function(){ secs++; ccTime.textContent=ccFmt(secs); },1000);
          ccSilentRun(0);
        });
      }
    });

    ccBuild();
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

  /* ===== Hero promo video ===== */
  var hv=document.getElementById('heroPromo'),
      hvWrap=hv ? hv.parentElement : null,
      hvBtn=document.getElementById('heroPromoToggle');

  if(hv && hvBtn){
    function hvSync(){
      var paused=hv.paused;
      hvWrap.classList.toggle('paused',paused);
      hvBtn.setAttribute('aria-label', paused ? 'Play video' : 'Pause video');
    }
    var hvUserPaused=false;
    var hvReduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    hvBtn.addEventListener('click',function(){
      if(hv.paused){ hvUserPaused=false; hv.play().catch(function(){}); }
      else { hvUserPaused=true; hv.pause(); }
      hvSync();
    });
    hv.addEventListener('play',hvSync);
    hv.addEventListener('pause',hvSync);

    // honour reduced-motion: hold on the poster frame until asked
    if(hvReduced){
      hv.removeAttribute('autoplay');
      hvUserPaused=true;
      hv.pause();
    }
    hvSync();

    // don't burn CPU/battery while the hero is off-screen
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if(hvUserPaused) return;
          if(e.isIntersecting) hv.play().catch(function(){});
          else hv.pause();
        });
      },{threshold:.15}).observe(hv);
    }
  }
})();
