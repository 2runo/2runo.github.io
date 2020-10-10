var $video = $("#video");
var video = $("#video")[0];
var $canvas = $("#canvas");
var canvas = $("#canvas")[0];
var ctx = canvas.getContext('2d');
var cursor = $("#cursor")[0];

if (navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ video: {
      width: { ideal: window.innerWidth }, height: { ideal: window.innerHeight }
  }})
    .then(stream => {
      video.srcObject = stream;
    })
    .catch(err => {
      console.warn(err);
    });
}

function takePic() {
    // 사진 찍기
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    console.log('sdf')

    ctx.drawImage(video, 0, 0);
    $canvas.css('display', 'block');
    $canvas.css('visibility', 'visible');
    $video.css('display', 'none');
    $video.css('visibility', 'hidden');

    soundMap = new SoundMap();

    var lastMove = 0;
    document.getelemen
    $(document).on('vmousemove touchmove click',
        e => {
            if(Date.now() - lastMove > 500) {
                lastMove = Date.now();
                try {
                    var posX = e.changedTouches[0].pageX;
                    var posY = e.changedTouches[0].pageY;
                } catch(_) {
                    var posX = e.offsetX;
                    var posY = e.offsetY;
                }
                var tone = soundMap.getTone(posX, posY);
                console.log(tone, posX, posY);
            }
    });
}

var timeoutIds = [];
$('body').on("vmousedown touchstart", () => {
    let id = setTimeout(takePic, 1000);  // 1초 누르고 있으면 사진 찍기
    timeoutIds.push(id);
})

$('body').on("vmouseup touchend", () => {
    for (var i in timeoutIds) {
        clearTimeout(timeoutIds[i]);
    }
    timeoutIds = [];
})


class SoundMap {
    getPixelRGB(x, y) {
        // 특정 pixel의 rgb 값을 반환
        var data = ctx.getImageData(x, y, 1, 1).data;
        return [data[0], data[1], data[2]];
    }
    
    positive(n) {
        // n >= 0 -> n
        // n < 0 -> 0
        if (n < 0) {return 0}
        return n;
    }
    
    max(n, m) {
        // n > m -> m
        // n <= m -> n
        if (n > m) {return m}
        return n;
    }
    
    getRGB(x, y, range) {
        // 탐색 범위의 평균 RGB를 반환
        // x 탐색 범위: (x - range) ~ (x + range)
        // y 탐색 범위: (y - range) ~ (y + range)
        var sum = [0, 0, 0];
        var cnt = 0;
        var step = 3;
        for (var i = this.positive(x-range); i <= this.max(x+range, canvas.width); i += step) {
            for (var j = this.positive(y-range); j <= this.max(y+range, canvas.height); j += step) {
                var rgb = this.getPixelRGB(i, j);
                sum[0] += rgb[0];
                sum[1] += rgb[1];
                sum[2] += rgb[2];
                cnt += 1;
            }
        }
        return [sum[0] / cnt, sum[1] / cnt, sum[2] / cnt]; 
    }
    
    rgbToTone(rgb) {
        // rgb 값을 tone으로 변환
        var tone = 255 - (rgb[0] + rgb[1] + rgb[2]) / 3;
        var tone = Math.round(tone);
        return tone;
    }
    
    getPixelTone(x, y) {
        // 특정 pixel의 tone 반환
        this.toCanvas();
        var rgb = this.getPixelRGB(x, y);
        var tone = this.rgbToTone(rgb);
        return tone;
    }
    
    getTone(x, y, range) {
        // 특정 픽셀과 그 주변의 평균 tone 반환
        // 탐색 범위 : range
        if (range == undefined) {
            range = 30;
        }
        var rgb = this.getRGB(x, y, range);
        var tone = this.rgbToTone(rgb);
        return tone;
    }
}


