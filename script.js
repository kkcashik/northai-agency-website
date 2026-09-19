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

  /* ===== Live demo line: copy phone number to clipboard ===== */
  var dlCopy=document.getElementById('dlCopy'), dlCopyLabel=document.getElementById('dlCopyLabel');
  if(dlCopy){
    var dlCopyTimer=null;
    dlCopy.addEventListener('click',function(){
      var number=dlCopy.getAttribute('data-display')||dlCopy.getAttribute('data-number')||'';
      function showCopied(){
        clearTimeout(dlCopyTimer);
        dlCopy.classList.add('copied');
        dlCopyLabel.textContent='Copied!';
        dlCopyTimer=setTimeout(function(){
          dlCopy.classList.remove('copied');
          dlCopyLabel.textContent='Copy';
        },1800);
      }
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(number).then(showCopied).catch(function(){});
      } else {
        try{
          var ta=document.createElement('textarea');
          ta.value=number; ta.style.position='fixed'; ta.style.opacity='0';
          document.body.appendChild(ta); ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          showCopied();
        }catch(e){}
      }
    });
  }

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
  // Markup carries the final value, so a counter that never animates still reads
  // correctly instead of getting stuck on a placeholder zero.
  counters.forEach(setFinal);
  if(!reduce){
    cio=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ animateCount(e.target); cio.unobserve(e.target); }
      });
    },{threshold:0, rootMargin:"0px 0px -10% 0px"});
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

  var form=document.getElementById('demoForm'),
      ok=document.getElementById('formOk'),
      formErr=document.getElementById('formErr'),
      submitBtn=document.getElementById('formSubmit');

  function setFieldError(input,msg){
    var box=document.getElementById(input.id+'Err');
    if(box) box.textContent=msg||'';
    input.classList.toggle('invalid',!!msg);
    input.setAttribute('aria-invalid',msg?'true':'false');
  }

  if(form){
    // Clear a field's error as soon as the person starts correcting it.
    ['leadName','email'].forEach(function(id){
      var el=document.getElementById(id);
      if(el) el.addEventListener('input',function(){ if(el.classList.contains('invalid')) setFieldError(el,''); });
    });

    form.addEventListener('submit',function(e){
      e.preventDefault();
      var name=document.getElementById('leadName'),
          clinic=document.getElementById('leadClinic'),
          email=document.getElementById('email'),
          phone=document.getElementById('leadPhone');

      var firstBad=null;
      if(name && !name.value.trim()){ setFieldError(name,'Please enter your name.'); firstBad=firstBad||name; }
      else if(name){ setFieldError(name,''); }
      if(!email.value.trim()){ setFieldError(email,'Please enter your email.'); firstBad=firstBad||email; }
      else if(!email.checkValidity()){ setFieldError(email,'Please enter a valid email address.'); firstBad=firstBad||email; }
      else { setFieldError(email,''); }
      if(firstBad){ firstBad.focus(); return; }

      var payload={
        name: name ? name.value.trim() : "",
        clinic: clinic ? clinic.value.trim() : "",
        email: email.value,
        phone: phone ? phone.value.trim() : "",
        source: "NorthAI website",
        page: location.href,
        submitted_at: new Date().toISOString()
      };

      formErr.classList.remove('show');
      submitBtn.disabled=true;
      submitBtn.classList.add('loading');
      submitBtn.querySelector('.cf-submit-label').textContent='Sending…';

      function succeed(){
        form.style.display='none';
        ok.classList.add('show');
      }
      function fail(){
        submitBtn.disabled=false;
        submitBtn.classList.remove('loading');
        submitBtn.querySelector('.cf-submit-label').textContent='Book my free demo';
        formErr.classList.add('show');
      }

      if(GHL_WEBHOOK_URL.indexOf('http')!==0){ succeed(); return; }

      fetch(GHL_WEBHOOK_URL,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(payload)
      }).then(function(res){
        if(res && res.ok===false) fail(); else succeed();
      }).catch(fail);
    });
  }

  /* ===== ROI calculator ===== */
  var roiCalls=document.getElementById('roiCalls'),
      roiMissed=document.getElementById('roiMissed'),
      roiValue=document.getElementById('roiValue'),
      roiLost=document.getElementById('roiLost'),
      roiCallCount=document.getElementById('roiCallCount');

  function fmt(n){ return Math.round(n).toLocaleString('en-US'); }

  // Clamps to the field's own min/max so negatives and typos can't produce
  // a nonsense estimate.
  function fieldValue(el){
    var n=parseFloat(el.value);
    if(!isFinite(n)) return 0;
    var min=parseFloat(el.min), max=parseFloat(el.max);
    if(isFinite(min)) n=Math.max(n,min);
    if(isFinite(max)) n=Math.min(n,max);
    return n;
  }

  function calcRoi(){
    if(!roiCalls) return;
    var calls=fieldValue(roiCalls),
        missed=fieldValue(roiMissed),
        value=fieldValue(roiValue);
    var missedCalls=calls*(missed/100);
    roiLost.textContent=fmt(missedCalls*value);
    roiCallCount.textContent=fmt(missedCalls)+(Math.round(missedCalls)===1?' missed call':' missed calls');
  }
  if(roiCalls){
    [roiCalls,roiMissed,roiValue].forEach(function(el){
      var fallback=el.getAttribute('value')||'0';
      el.addEventListener('input',calcRoi);
      el.addEventListener('blur',function(){
        // Snap to the clamped value, and restore the default rather than
        // leaving an empty field reading as a $0 estimate.
        el.value = el.value.trim()==='' ? fallback : fieldValue(el);
        calcRoi();
      });
    });
    calcRoi();
  }

  /* ===== Hero call demo playback (with voice) ===== */
  var ccPlay=document.getElementById('ccPlay'),
      ccWave=document.getElementById('ccWave'),
      ccTime=document.getElementById('ccTime'),
      ccStatusText=document.getElementById('ccStatusText'),
      ccPlayLabel=document.getElementById('ccPlayLabel'),
      ccLines=document.querySelectorAll('#ccTranscript .cc-msg'),
      ccTags=document.querySelectorAll('#ccFoot .cc-msg');

  if(ccPlay){
    var ccTimers=[], ccTicker=null, ccPlaying=false;
    var synth=window.speechSynthesis||null;
    var ccVoice={us:null,them:null};

    function ccPickVoices(){
      if(!synth) return;
      var vs=synth.getVoices()||[];
      var en=vs.filter(function(v){ return /^en(-|_|$)/i.test(v.lang); });
      if(!en.length) en=vs;
      function find(names){
        for(var n=0;n<names.length;n++){
          for(var i=0;i<en.length;i++){
            if(en[i].name.toLowerCase().indexOf(names[n])>=0) return en[i];
          }
        }
        return null;
      }
      // receptionist = warm female voice; patient = a distinctly different voice
      ccVoice.us   = find(['jenny','aria','samantha','zira','google us english','female']) || en[0] || null;
      ccVoice.them = find(['guy','david','mark','daniel','google uk english male','male']) || en[1] || en[0] || null;
    }
    if(synth){ ccPickVoices(); if(synth.onvoiceschanged!==undefined) synth.onvoiceschanged=ccPickVoices; }

    function ccReset(){
      ccTimers.forEach(clearTimeout); ccTimers=[];
      if(ccTicker) clearInterval(ccTicker);
      if(synth){ try{ synth.cancel(); }catch(e){} }
      ccStopAudio();
      ccLines.forEach(function(m){ m.classList.remove('show'); });
      ccTags.forEach(function(m){ m.classList.remove('show'); });
      ccWave.classList.add('paused');
      ccTime.textContent='00:00';
      ccPlaying=false;
    }

    function ccFinish(){
      if(ccTicker) clearInterval(ccTicker);
      ccWave.classList.add('paused');
      ccTags.forEach(function(t,i){
        ccTimers.push(setTimeout(function(){ t.classList.add('show'); }, 250+i*320));
      });
      ccStatusText.textContent='Call complete · patient booked';
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

    /* Pre-recorded neural voice clips — fresh Audio objects per playback
       (reusing one element across replays is what made sound flaky) */
    var ccCurrentClip=null;
    // warm the browser cache once so first play is instant
    for(var ci=1;ci<=4;ci++){ var warm=new Audio('audio/call-'+ci+'.mp3?v=1'); warm.preload='auto'; }

    function ccStopAudio(){
      if(ccCurrentClip){ try{ ccCurrentClip.onended=null; ccCurrentClip.pause(); }catch(e){} ccCurrentClip=null; }
    }

    function ccSpeak(i){
      if(!ccPlaying) return;
      if(i>=ccLines.length){ ccFinish(); return; }
      var el=ccLines[i];
      var text=el.textContent.replace(/[“”"]/g,'').trim();
      var isUs=el.classList.contains('cc-us');

      function reveal(){
        el.classList.add('show');
        ccWave.classList.remove('paused');
      }
      function next(){
        if(!ccPlaying) return;
        ccWave.classList.add('paused');
        ccTimers.push(setTimeout(function(){ ccSpeak(i+1); }, 420));
      }

      var clip=new Audio('audio/call-'+(i+1)+'.mp3?v=1');
      ccCurrentClip=clip;
      clip.onended=next;
      var p=clip.play();
      if(p && p.then){
        p.then(reveal) // text appears only once audio is actually playing
         .catch(function(){ reveal(); ccSpeakTTS(text,isUs,next); });
      } else { reveal(); }
    }

    /* Fallback: browser speech synthesis if audio files can't play */
    function ccSpeakTTS(text,isUs,done){
      if(!synth){ ccTimers.push(setTimeout(done, Math.max(1900, text.length*46))); return; }
      var u=new SpeechSynthesisUtterance(text);
      u.voice = isUs ? ccVoice.us : ccVoice.them;
      u.rate  = isUs ? 1.03 : 1.0;
      u.pitch = isUs ? 1.06 : 0.92;
      u.onend=done;
      u.onerror=done;
      try{ synth.speak(u); }catch(e){ done(); }
    }

    ccPlay.addEventListener('click',function(){
      ccReset();
      ccPlaying=true;
      ccPlay.classList.add('hidden');
      ccStatusText.textContent='Live · answering now';
      ccWave.classList.remove('paused');

      var secs=0;
      ccTicker=setInterval(function(){
        secs++; ccTime.textContent='00:'+(secs<10?'0':'')+secs;
      },1000);

      if(synth){ try{ synth.resume(); }catch(e){} }
      ccSpeak(0); // first utterance fires inside the click gesture (required by browsers)
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
