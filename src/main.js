(() => {
  ('use strict');

  const get = (el) => document.querySelector(el);
  class ImageEditor {
    constructor() {
      this.container = get('main');
      this.canvas = get('.canvas');
      this.ctx = this.canvas.getContext('2d');
      this.width = 700;
      this.height = 411;
      this.minSize = 20;
      this.canvas.width = this.width;
      this.canvas.height = this.height;

      // 캔버스 라인 그리기
      // 캔버스 크롭하기 위해 라인의 넓이를 지정
      this.ctx.lineWidth = 3;
      this.ctx.strokeStyle = 'coral';
      // 타겟 이미지
      this.targetImage = get('.image_wrap');
      this.targetCanvas = document.createElement('canvas');
      this.targetCtx = this.targetCanvas.getContext('2d');
      this.targetWidth;
      this.taretHeight;
      // 왼쪽 캔버스의 위치에 대한 position
      this.sourceX;
      this.sourceY;
      this.sourceWidth;
      this.img = new Image();
      // 버튼 정의
      this.btnFlip = get('.btn_flip');
      this.btnSepia = get('.btn_sepia');
      this.btnGray = get('.btn_gray');
      this.btnSave = get('.btn_save');
      this.fileDrag = get('.drag_area');
      this.fileInput = get('.drag_area input');
      this.fileImage = get('.fileImage');
      // 메서드
      this.clickEvent();
      this.fileEvent();
      this.drawEvent();
    }
    clickEvent() {
      this.btnFlip.addEventListener('click', this.flipEvent.bind(this));
      this.btnSepia.addEventListener('click', this.sepiaEvent.bind(this));
      this.btnGray.addEventListener('click', this.grayEvent.bind(this));
      this.btnSave.addEventListener('click', this.download.bind(this));
    }

    flipEvent() {
      this.targetCtx.translate(this.targetWidth, 0);
      this.targetCtx.scale(-1, 1);
      this.targetCtx.drawImage(
        this.img,
        this.sourceX,
        this.sourceY,
        this.sourceWidth,
        this.sourceHeight,
        0,
        0,
        this.targetWidth,
        this.targetHeight,
      );
    }

    sepiaEvent() {
      this.targetCtx.clearRect(0, 0, this.targetWidth, this.targetHeight);
      this.targetCtx.filter = 'sepia(1)';
      this.targetCtx.drawImage(
        this.img,
        this.sourceX,
        this.sourceY,
        this.sourceWidth,
        this.sourceHeight,
        0,
        0,
        this.targetWidth,
        this.targetHeight,
      );
    }

    grayEvent() {
      this.targetCtx.clearRect(0, 0, this.targetWidth, this.targetHeight);
      this.targetCtx.filter = 'grayscale(1)';
      this.targetCtx.drawImage(
        this.img,
        this.sourceX,
        this.sourceY,
        this.sourceWidth,
        this.sourceHeight,
        0,
        0,
        this.targetWidth,
        this.targetHeight,
      );
    }

    download() {
      const url = this.targetCanvas.toDataURL();
      const downloader = document.createElement('a');
      downloader.style.display = 'none';
      downloader.setAttribute('href', url);
      downloader.setAttribute('download', 'canvas.png');
      this.container.appendChild(downloader);
      downloader.click();
      setTimeout(() => {
        this.container.removeChild(downloader);
      }, 100);
    }

    fileEvent() {
      this.fileInput.addEventListener('change', (event) => {
        const fileName = URL.createObjectURL(event.target.files[0]);
        const img = new Image();
        img.addEventListener('load', (e) => {
          this.width = e.path[0].naturalWidth;
          this.height = e.path[0].naturalHeight;
        });
        this.fileImage.setAttribute('src', fileName);
        img.setAttribute('src', fileName);
      });
    }

    // 크롭 기능
    drawEvent() {
      const canvasX = this.canvas.getBoundingClientRect().left;
      const canvasY = this.canvas.getBoundingClientRect().top;
      //   start, end position
      let sX, sY, eX, eY;
      let drawStart = false;

      this.canvas.addEventListener('mousedown', (e) => {
        // 현재 윈도우 좌표 지점과 캔버스 좌표 지점을 뺴서 캔버스 안의 위치 시키도록 만듦, 10진수
        sX = parseInt(e.clientX - canvasX, 10);
        sY = parseInt(e.clientY - canvasY, 10);
        drawStart = true;
      });

      this.canvas.addEventListener('mousemove', (e) => {
        if (!drawStart) return;
        eX = parseInt(e.clientX - canvasX, 10);
        eY = parseInt(e.clientY - canvasY, 10);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeRect(sX, sY, eX - sX, eY - sY);
      });

      this.canvas.addEventListener('mouseup', () => {
        drawStart = false;

        // 마우스 놓는 시점에서 절대값을 구해 줌. 기준은 minSize
        if (
          Math.abs(eX - sX) < this.minSize ||
          Math.abs(eY - sY) < this.minSize
        )
          return;

        // 조건에 충족했을 시, s,e position 아웃풋 진행, 좌표에 대한 이해가 필요
        // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImages
        this.drawOutput(sX, sY, eX - sX, eY - sY);
      });
    }

    drawOutput(x, y, width, height) {
      // 캔버스의 draw를 초기화
      this.targetImage.innerHTML = '';
      if (Math.abs(width) <= Math.abs(height)) {
        // 캔버스 높이, 캔버스 넓이
        this.targetHeight = this.height;
        this.targetWidth = (this.targetHeight * width) / height;
      } else {
        this.targetWidth = this.width;
        this.targetHeight = (this.targetWidth * height) / width;
      }

      this.targetCanvas.width = this.targetWidth;
      this.targetCanvas.height = this.targetHeight;
      this.img.addEventListener('load', () => {
        const buffer = this.img.width / this.width;
        this.sourceX = x * buffer;
        this.sourceY = y * buffer;
        this.sourceWidth = width * buffer;
        this.sourceHeight = height * buffer;
        this.targetCtx.drawImage(
          this.img,
          this.sourceX,
          this.sourceY,
          this.sourceWidth,
          this.sourceHeight,
          0,
          0,
          this.targetWidth,
          this.targetHeight,
        );
      });
      this.img.src = this.fileImage.getAttribute('src');
      this.targetImage.appendChild(this.targetCanvas);
    }
  }

  new ImageEditor();
})();
