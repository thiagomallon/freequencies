(function() {
  // console.log('I\'m alive!');
  var menu = document.createElement('div');
  menu.id = 'wave-generator';
  menu.className = 'wave-generator';
  var btnAdd = document.createElement('button');
  btnAdd.id = 'btn-add-wave';
  btnAdd.className = 'icon-btn-plus';
  menu.appendChild(btnAdd);
  document.body.appendChild(menu);
  // EVENTS
  btnAdd.addEventListener('click', function() {
    new WaveFactory().createWave(new(window.AudioContext || window.webkitAudioContext)());
  });
})();

function WaveFactory() {

  // properties
  this.wavesQtt = 0;
  this.audioCtx = null;
  this.analyser = null;
  this.canvas = null;
  this.systemStarted = false;
  this.dataArray = null;
  this.bufferLength = null;
  this.freqs = ['396', '417', '528', '639', '741', '852', '963'];
  this.waveformIcons = ['icon-btn-sine-wave', 'icon-btn-square-wave', 'icon-btn-sawtooth-wave', 'icon-btn-triangular-wave'];
  this.waveform = ['sine', 'square', 'sawtooth', 'triangle'];

  // wave creation container
  this.createWave = function(audioCtx) {
    if (this.getLastWaveBox() > 4) {
      console.log('By now our limit is 5, budy. Tks for visiting');
    } else {
      this.audioCtx = audioCtx;
      // this.createAnalizer();
      var analizerBox = this.createAnalizerBox();
      var waveBox = this.createWaveBox();
      var freqBox = this.createFrequencyBox();
      var detuneBox = this.createDetuneBox();
      var toneBox = this.createWaveformBox();
      var ballBox = this.createBallanceBox();
      var vlmBox = this.createVolumeBox();
      var ctrlBox = this.createControlBox();
      waveBox.appendChild(analizerBox);
      waveBox.appendChild(freqBox);
      waveBox.appendChild(detuneBox);
      waveBox.appendChild(toneBox);
      waveBox.appendChild(ballBox);
      waveBox.appendChild(vlmBox);
      waveBox.appendChild(ctrlBox);
      document.body.appendChild(waveBox);
      this.createOscillator();
    }
  };

  //
  this.createLabelElement = function(text) {
    var labelBox = document.createElement('label');
    var label = document.createTextNode(text);
    labelBox.appendChild(label);
    return labelBox;
  };

  //
  this.createDisplay = function(elId, elClass, elValue) {
    var display = document.createElement('input');
    display.id = elId + (this.wavesQtt);
    display.className = elClass;
    display.value = elValue;
    return display;
  };

  //
  this.createSlide = function(elMin, elMax, elStep, elValue, elId) {
    var slide = document.createElement('input');
    slide.className = 'slide';
    slide.min = elMin;
    slide.max = elMax;
    slide.step = elStep;
    slide.value = elValue;
    slide.type = 'range';
    slide.id = elId + (this.wavesQtt);
    return slide;
  };

  // search for the last increment of waveBox factory
  this.getLastWaveBox = function() {
    this.wavesQtt = document.getElementsByClassName("waveBox").length;
    // console.log('Waves Qtt: ' + this.wavesQtt);
    return this.wavesQtt;
  }

  // create the main box for wave box controling
  this.createWaveBox = function() {
    var waveBox = document.createElement('div');
    waveBox.id = "waveBox" + this.getLastWaveBox();
    waveBox.className = "waveBox";
    return waveBox;
  };

  //
  this.createFrequencyBox = function() {
    var self = this;
    var freqBox = document.createElement('div');
    freqBox.className = "ctrlSubContente first";
    freqBox.id = "freqBox" + this.wavesQtt;
    // LABEL
    freqBox.appendChild(this.createLabelElement("Frequency "));
    // DISPLAY
    var display = this.createDisplay('freqDisplay', 'subDisplay', '396Hz')
    freqBox.appendChild(display);
    // SLIDE
    var slide = this.createSlide('0', '20154', '0.1', '396', 'freqSlide');
    freqBox.appendChild(slide);
    // SELECT FREQ.
    var selectFreq = document.createElement('select');
    selectFreq.id = 'selFreq' + (this.wavesQtt);
    for (var i = 0; i < this.freqs.length; i++) {
      var opt = document.createElement('option');
      opt.value = this.freqs[i];
      opt.innerHTML = this.freqs[i] + "Hz";
      selectFreq.appendChild(opt);
    }
    freqBox.appendChild(selectFreq);
    selectFreq.addEventListener('change', function() {
      slide.value = this.value;
      display.value = this.value + "Hz";
      self.generateSoundFreq(this.value);
    });
    slide.addEventListener("change", function() {
      display.value = this.value + "Hz";
      self.generateSoundFreq(this.value);
    });
    display.addEventListener("change", function() {
      slide.value = this.value;
      // var wFreq = this.value.replace(/[^\.](\D)/g, '');
      var wFreq = this.value;
      console.log(wFreq);
      self.generateSoundFreq(wFreq);
    });
    return freqBox;
  };

  //
  this.createDetuneBox = function() {
    var self = this;
    var detuneBox = document.createElement('div');
    detuneBox.className = "ctrlSubContente first";
    detuneBox.id = "detuneBox" + this.wavesQtt;
    // LABEL
    detuneBox.appendChild(this.createLabelElement("Detune "));
    // DISPLAY
    var display = this.createDisplay('detuneDisplay', 'subDisplay', '0')
    detuneBox.appendChild(display);
    // SLIDE
    var slide = this.createSlide('0', '100', '0.5', '0', 'detuneSlide');
    detuneBox.appendChild(slide);
    slide.addEventListener("change", function() {
      self.generateSoundDetune(this.value);
      display.value = this.value;
    });
    display.addEventListener("change", function() {
      self.generateSoundDetune(this.value);
      slide.value = this.value;
    });
    return detuneBox;
  };

  //
  this.createWaveformBox = function() {
    var self = this;
    var waveformBox = document.createElement('div');
    waveformBox.className = "ctrlSubContente";
    waveformBox.id = "waveformBox" + this.wavesQtt;
    // LABEL
    waveformBox.appendChild(this.createLabelElement("Waveform "));
    // BTN's BOX
    var btnsBox = document.createElement("div");
    btnsBox.className = 'waveform-btns-box';
    // SELECT FREQ.
    for (var i = 0; i < this.waveformIcons.length; i++) {
      var btnWaveform = document.createElement('button');
      btnWaveform.value = this.waveformIcons[i];
      btnWaveform.className = this.waveformIcons[i];
      btnWaveform.title = this.waveform[i];
      btnsBox.appendChild(btnWaveform);
      btnWaveform.addEventListener('click', function() {
        self.selSoundTone(this.title);
      });
    }
    waveformBox.appendChild(btnsBox);
    // waveformBox.appendChild(selectTone);
    return waveformBox;
  };

  //
  this.createBallanceBox = function() {
    var self = this;
    var ballBox = document.createElement('div');
    ballBox.className = "ctrlSubContente";
    ballBox.id = "ballBox" + this.wavesQtt;
    // LABEL
    ballBox.appendChild(this.createLabelElement("Balance "));
    // DISPLAY
    var display = this.createDisplay('ballDisplay', 'subDisplay', '0')
    ballBox.appendChild(display);
    // SLIDE
    var slide = this.createSlide('0', '2', '0.1', '1', 'ballSlide');
    ballBox.appendChild(slide);
    // BTN's
    var leftBtn = document.createElement('button');
    leftBtn.innerHTML = 'Left';
    ballBox.appendChild(leftBtn);
    var middleBtn = document.createElement('button');
    middleBtn.innerHTML = 'Middle';
    ballBox.appendChild(middleBtn);
    var rightBtn = document.createElement('button');
    rightBtn.innerHTML = 'Right';
    ballBox.appendChild(rightBtn);
    // events
    slide.addEventListener("change", function() {
      display.value = (this.value - 1);
      self.panNode.pan.value = (this.value - 1);
    });
    display.addEventListener("change", function() {
      self.panNode.pan.value = this.value;
      slide.value = (this.value + 1);
    });
    // events btn
    leftBtn.addEventListener("click", function() {
      display.value = '-1';
      slide.value = 0;
      self.panNode.pan.value = -1;
    });
    middleBtn.addEventListener("click", function() {
      display.value = '0';
      slide.value = 1;
      self.panNode.pan.value = 0;
    });
    rightBtn.addEventListener("click", function() {
      display.value = '1';
      slide.value = 2;
      self.panNode.pan.value = 1;
    });
    return ballBox;
  };

  //
  this.createVolumeBox = function() {
    var self = this;
    var vlmBox = document.createElement('div');
    vlmBox.className = "ctrlSubContente";
    vlmBox.id = "vlmBox" + this.wavesQtt;
    // LABEL
    vlmBox.appendChild(this.createLabelElement("Volume "));
    // DISPLAY
    var display = this.createDisplay('vlmDisplay', 'subDisplay', '5')
    vlmBox.appendChild(display);
    // SLIDE
    var slide = this.createSlide('0', '10', '1', '5', 'vlmSlide');
    vlmBox.appendChild(slide);
    // events
    slide.addEventListener("change", function() {
      display.value = this.value;
      self.gainNode.gain.value = this.value.replace(/\D/g, '')
    });
    display.addEventListener("change", function() {
      slide.value = this.value;
      self.gainNode.gain.value = this.value.replace(/\D/g, '');
    });
    return vlmBox;
  };

  //
  this.createControlBox = function() {
    var self = this;
    var ctrlBox = document.createElement('div');
    ctrlBox.className = "ctrlSubContente last";
    ctrlBox.id = "ctrlBox" + this.wavesQtt;

    var playBtn = document.createElement('button');
    playBtn.innerHTML = 'Play';
    playBtn.id = 'playBtnWB' + this.wavesQtt;
    ctrlBox.appendChild(playBtn);
    playBtn.addEventListener('click', function() {
      if (!self.systemStarted) {
        self.systemStarted = true;
        self.oscillator.start();
        self.draw();
      }
      self.panNode.connect(self.audioCtx.destination);
    });

    var stopBtn = document.createElement('button');
    stopBtn.innerHTML = 'Stop';
    stopBtn.stop = 'stopBtnWB' + this.wavesQtt;
    ctrlBox.appendChild(stopBtn);
    stopBtn.addEventListener('click', function() {
      try {
        self.panNode.disconnect(self.audioCtx.destination);
      } catch (e) {
        console.log('Hello, matey! It is already stoped. ');
        // console.log(e);
      }
    });
    return ctrlBox;
  };

  this.generateSoundFreq = function(dimension) {
    // console.log(dimension);
    this.oscillator.frequency.value = dimension;
  }

  this.generateSoundDetune = function(dimension) {
    // console.log('Detune: ' + dimension);
    this.oscillator.detune.value = dimension;
  }

  this.selSoundTone = function(dimension) {
    // console.log('Sound Tone: ' + dimension);
    this.oscillator.type = dimension;
  }

  // OSCILLADOR
  this.createOscillator = function() {
    // this.audioCtx = audioCtx;
    // // create gain node
    this.gainNode = this.audioCtx.createGain();
    // // Create a stereo panner
    this.panNode = this.audioCtx.createStereoPanner();
    // create Analizer
    this.analyser = this.audioCtx.createAnalyser();
    // create Oscillator node
    this.oscillator = this.audioCtx.createOscillator();

    this.gainNode.gain.value = 5;
    this.panNode.pan.value = 0;
    this.analyser.fftSize = 2048;
    this.oscillator.type = 'sine';
    this.generateSoundFreq(396);
    this.generateSoundDetune(0);

    // Analizer setup
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
    this.analyser.getByteTimeDomainData(this.dataArray);

    this.gainNode.connect(this.panNode);
    this.gainNode.connect(this.analyser);
    this.oscillator.connect(this.gainNode);
  }

  // ANALIZER
  this.createAnalizerBox = function() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'screen' + this.waveQtt;
    this.canvas.className = "ctrlSubContente first nopadding";
    this.canvas.width = 195;
    this.canvas.height = 100;
    return this.canvas;
  }

  this.draw = function() {
    var canvasCtx = this.canvas.getContext('2d');

    drawVisual = requestAnimationFrame(this.draw);

    this.analyser.getByteTimeDomainData(this.dataArray);

    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    canvasCtx.beginPath();

    var sliceWidth = this.canvas.width * 1.0 / this.bufferLength;
    var x = 0;

    for (var i = 0; i < this.bufferLength; i++) {
      var v = this.dataArray[i] / 128.0;
      var y = v * this.canvas.height / 2;

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    canvasCtx.lineTo(this.canvas.width, this.canvas.height / 2);
    canvasCtx.stroke();
  }
}
