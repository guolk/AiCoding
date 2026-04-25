(function() {
    'use strict';

    // 状态管理
    const state = {
        originalImage: null,
        originalImageData: null,
        canvas: null,
        ctx: null,
        previewCanvas: null,
        previewCtx: null,
        currentImageData: null,
        history: [],
        historyIndex: -1,
        maxHistoryLength: 20,
        isCropping: false,
        isMosaicking: false,
        cropBox: {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        },
        cropRatio: null,
        mosaicSize: 10,
        mosaicBrushSize: 30,
        adjustments: {
            brightness: 0,
            contrast: 0,
            saturation: 0
        }
    };

    // DOM元素
    const elements = {
        fileInput: document.getElementById('file-input'),
        mainCanvas: document.getElementById('main-canvas'),
        previewCanvas: document.getElementById('preview-canvas'),
        placeholder: document.getElementById('placeholder'),
        undoBtn: document.getElementById('undo-btn'),
        redoBtn: document.getElementById('redo-btn'),
        resetBtn: document.getElementById('reset-btn'),
        exportBtn: document.getElementById('export-btn'),
        rotateLeftBtn: document.getElementById('rotate-left-btn'),
        rotateRightBtn: document.getElementById('rotate-right-btn'),
        flipHBtn: document.getElementById('flip-h-btn'),
        flipVBtn: document.getElementById('flip-v-btn'),
        cropRatioInputs: document.querySelectorAll('input[name="crop-ratio"]'),
        startCropBtn: document.getElementById('start-crop-btn'),
        applyCropBtn: document.getElementById('apply-crop-btn'),
        cancelCropBtn: document.getElementById('cancel-crop-btn'),
        cropOverlay: document.getElementById('crop-overlay'),
        cropBox: document.getElementById('crop-box'),
        brightnessSlider: document.getElementById('brightness-slider'),
        brightnessValue: document.getElementById('brightness-value'),
        contrastSlider: document.getElementById('contrast-slider'),
        contrastValue: document.getElementById('contrast-value'),
        saturationSlider: document.getElementById('saturation-slider'),
        saturationValue: document.getElementById('saturation-value'),
        applyAdjustmentsBtn: document.getElementById('apply-adjustments-btn'),
        resetAdjustmentsBtn: document.getElementById('reset-adjustments-btn'),
        watermarkText: document.getElementById('watermark-text'),
        watermarkFontSize: document.getElementById('watermark-font-size'),
        watermarkColor: document.getElementById('watermark-color'),
        watermarkOpacity: document.getElementById('watermark-opacity'),
        watermarkOpacityValue: document.getElementById('watermark-opacity-value'),
        watermarkPosition: document.getElementById('watermark-position'),
        addWatermarkBtn: document.getElementById('add-watermark-btn'),
        mosaicSizeSlider: document.getElementById('mosaic-size'),
        mosaicSizeValue: document.getElementById('mosaic-size-value'),
        mosaicBrushSizeSlider: document.getElementById('mosaic-brush-size'),
        mosaicBrushSizeValue: document.getElementById('mosaic-brush-size-value'),
        startMosaicBtn: document.getElementById('start-mosaic-btn'),
        stopMosaicBtn: document.getElementById('stop-mosaic-btn'),
        exportPanel: document.getElementById('export-panel'),
        exportFormat: document.getElementById('export-format'),
        exportQuality: document.getElementById('export-quality'),
        qualityValue: document.getElementById('quality-value'),
        exportFilename: document.getElementById('export-filename'),
        confirmExportBtn: document.getElementById('confirm-export-btn'),
        cancelExportBtn: document.getElementById('cancel-export-btn'),
        closeExportBtn: document.getElementById('close-export-btn'),
        qualityControl: document.getElementById('quality-control')
    };

    // 初始化
    function init() {
        setupEventListeners();
        updateButtonsState();
    }

    // 事件监听器设置
    function setupEventListeners() {
        // 文件上传
        elements.fileInput.addEventListener('change', handleFileUpload);

        // 撤销重做
        elements.undoBtn.addEventListener('click', undo);
        elements.redoBtn.addEventListener('click', redo);
        elements.resetBtn.addEventListener('click', resetImage);

        // 导出
        elements.exportBtn.addEventListener('click', showExportPanel);
        elements.closeExportBtn.addEventListener('click', hideExportPanel);
        elements.cancelExportBtn.addEventListener('click', hideExportPanel);
        elements.confirmExportBtn.addEventListener('click', exportImage);
        elements.exportFormat.addEventListener('change', updateQualityControl);

        // 旋转翻转
        elements.rotateLeftBtn.addEventListener('click', () => rotate(-90));
        elements.rotateRightBtn.addEventListener('click', () => rotate(90));
        elements.flipHBtn.addEventListener('click', () => flip('horizontal'));
        elements.flipVBtn.addEventListener('click', () => flip('vertical'));

        // 裁剪
        elements.cropRatioInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                state.cropRatio = e.target.value === 'free' ? null : e.target.value;
                if (state.isCropping) {
                    resetCropBox();
                }
            });
        });
        elements.startCropBtn.addEventListener('click', startCrop);
        elements.applyCropBtn.addEventListener('click', applyCrop);
        elements.cancelCropBtn.addEventListener('click', cancelCrop);

        // 调整
        elements.brightnessSlider.addEventListener('input', (e) => {
            state.adjustments.brightness = parseInt(e.target.value);
            elements.brightnessValue.textContent = e.target.value;
            previewAdjustments();
        });
        elements.contrastSlider.addEventListener('input', (e) => {
            state.adjustments.contrast = parseInt(e.target.value);
            elements.contrastValue.textContent = e.target.value;
            previewAdjustments();
        });
        elements.saturationSlider.addEventListener('input', (e) => {
            state.adjustments.saturation = parseInt(e.target.value);
            elements.saturationValue.textContent = e.target.value;
            previewAdjustments();
        });
        elements.applyAdjustmentsBtn.addEventListener('click', applyAdjustments);
        elements.resetAdjustmentsBtn.addEventListener('click', resetAdjustments);

        // 水印
        elements.watermarkOpacity.addEventListener('input', (e) => {
            elements.watermarkOpacityValue.textContent = e.target.value;
        });
        elements.addWatermarkBtn.addEventListener('click', addWatermark);

        // 马赛克
        elements.mosaicSizeSlider.addEventListener('input', (e) => {
            state.mosaicSize = parseInt(e.target.value);
            elements.mosaicSizeValue.textContent = e.target.value;
        });
        elements.mosaicBrushSizeSlider.addEventListener('input', (e) => {
            state.mosaicBrushSize = parseInt(e.target.value);
            elements.mosaicBrushSizeValue.textContent = e.target.value;
        });
        elements.startMosaicBtn.addEventListener('click', startMosaic);
        elements.stopMosaicBtn.addEventListener('click', stopMosaic);

        // 裁剪框拖动
        setupCropBoxDrag();

        // 画布鼠标事件
        elements.mainCanvas.addEventListener('mousedown', handleCanvasMouseDown);
        elements.mainCanvas.addEventListener('mousemove', handleCanvasMouseMove);
        elements.mainCanvas.addEventListener('mouseup', handleCanvasMouseUp);
        elements.mainCanvas.addEventListener('mouseleave', handleCanvasMouseUp);
    }

    // 文件上传处理
    function handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                state.originalImage = img;
                
                // 设置画布尺寸
                elements.mainCanvas.width = img.width;
                elements.mainCanvas.height = img.height;
                elements.previewCanvas.width = img.width;
                elements.previewCanvas.height = img.height;

                // 获取上下文
                state.canvas = elements.mainCanvas;
                state.ctx = elements.mainCanvas.getContext('2d');
                state.previewCanvas = elements.previewCanvas;
                state.previewCtx = elements.previewCanvas.getContext('2d');

                // 绘制初始图像
                state.ctx.drawImage(img, 0, 0);
                state.originalImageData = state.ctx.getImageData(0, 0, elements.mainCanvas.width, elements.mainCanvas.height);

                // 隐藏占位符
                elements.placeholder.style.display = 'none';

                // 重置历史
                state.history = [];
                state.historyIndex = -1;
                saveState();

                // 更新按钮状态
                updateButtonsState();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    // 保存当前状态到历史
    function saveState() {
        if (!state.ctx) return;

        // 如果在重做栈中有元素，清除它们
        if (state.historyIndex < state.history.length - 1) {
            state.history = state.history.slice(0, state.historyIndex + 1);
        }

        // 获取当前图像数据
        const imageData = state.ctx.getImageData(0, 0, state.canvas.width, state.canvas.height);
        
        // 创建深拷贝
        const stateToSave = {
            imageData: cloneImageData(imageData),
            width: state.canvas.width,
            height: state.canvas.height
        };

        // 添加到历史
        state.history.push(stateToSave);
        
        // 限制历史长度
        if (state.history.length > state.maxHistoryLength) {
            state.history.shift();
        } else {
            state.historyIndex++;
        }

        updateButtonsState();
    }

    // 克隆ImageData
    function cloneImageData(imageData) {
        const clone = new ImageData(imageData.width, imageData.height);
        clone.data.set(imageData.data);
        return clone;
    }

    // 撤销
    function undo() {
        if (state.historyIndex <= 0) return;

        state.historyIndex--;
        restoreState(state.history[state.historyIndex]);
        updateButtonsState();
    }

    // 重做
    function redo() {
        if (state.historyIndex >= state.history.length - 1) return;

        state.historyIndex++;
        restoreState(state.history[state.historyIndex]);
        updateButtonsState();
    }

    // 恢复状态
    function restoreState(stateObj) {
        // 调整画布尺寸
        state.canvas.width = stateObj.width;
        state.canvas.height = stateObj.height;
        state.previewCanvas.width = stateObj.width;
        state.previewCanvas.height = stateObj.height;

        // 恢复图像数据
        state.ctx.putImageData(stateObj.imageData, 0, 0);
    }

    // 重置图像
    function resetImage() {
        if (!state.originalImage) return;

        // 恢复画布尺寸
        state.canvas.width = state.originalImage.width;
        state.canvas.height = state.originalImage.height;
        state.previewCanvas.width = state.originalImage.width;
        state.previewCanvas.height = state.originalImage.height;

        // 恢复原始图像
        state.ctx.drawImage(state.originalImage, 0, 0);

        // 保存状态
        saveState();
    }

    // 更新按钮状态
    function updateButtonsState() {
        const hasImage = state.originalImage !== null;
        
        // 基础按钮
        elements.undoBtn.disabled = state.historyIndex <= 0;
        elements.redoBtn.disabled = state.historyIndex >= state.history.length - 1;
        elements.resetBtn.disabled = !hasImage;
        elements.exportBtn.disabled = !hasImage;

        // 操作按钮
        elements.rotateLeftBtn.disabled = !hasImage;
        elements.rotateRightBtn.disabled = !hasImage;
        elements.flipHBtn.disabled = !hasImage;
        elements.flipVBtn.disabled = !hasImage;
        elements.startCropBtn.disabled = !hasImage;
        elements.applyAdjustmentsBtn.disabled = !hasImage;
        elements.resetAdjustmentsBtn.disabled = !hasImage;
        elements.addWatermarkBtn.disabled = !hasImage;
        elements.startMosaicBtn.disabled = !hasImage;
    }

    // 旋转
    function rotate(degrees) {
        if (!state.ctx) return;

        const canvas = state.canvas;
        const ctx = state.ctx;
        const width = canvas.width;
        const height = canvas.height;

        // 创建临时画布
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        // 如果是90度或-90度，交换宽高
        if (Math.abs(degrees) === 90) {
            tempCanvas.width = height;
            tempCanvas.height = width;
        } else {
            tempCanvas.width = width;
            tempCanvas.height = height;
        }

        // 绘制旋转后的图像
        tempCtx.save();
        tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
        tempCtx.rotate(degrees * Math.PI / 180);
        tempCtx.drawImage(canvas, -width / 2, -height / 2);
        tempCtx.restore();

        // 更新主画布
        canvas.width = tempCanvas.width;
        canvas.height = tempCanvas.height;
        state.previewCanvas.width = tempCanvas.width;
        state.previewCanvas.height = tempCanvas.height;
        
        ctx.drawImage(tempCanvas, 0, 0);

        // 保存状态
        saveState();
    }

    // 翻转
    function flip(direction) {
        if (!state.ctx) return;

        const canvas = state.canvas;
        const ctx = state.ctx;
        const width = canvas.width;
        const height = canvas.height;

        // 创建临时画布
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = width;
        tempCanvas.height = height;

        // 绘制翻转后的图像
        tempCtx.save();
        
        if (direction === 'horizontal') {
            tempCtx.translate(width, 0);
            tempCtx.scale(-1, 1);
        } else {
            tempCtx.translate(0, height);
            tempCtx.scale(1, -1);
        }
        
        tempCtx.drawImage(canvas, 0, 0);
        tempCtx.restore();

        // 更新主画布
        ctx.drawImage(tempCanvas, 0, 0);

        // 保存状态
        saveState();
    }

    // 开始裁剪
    function startCrop() {
        if (!state.ctx) return;

        state.isCropping = true;
        
        // 显示裁剪相关元素
        elements.cropOverlay.style.display = 'block';
        elements.startCropBtn.style.display = 'none';
        elements.applyCropBtn.style.display = 'inline-block';
        elements.cancelCropBtn.style.display = 'inline-block';

        // 初始化裁剪框
        resetCropBox();
    }

    // 重置裁剪框
    function resetCropBox() {
        const canvasRect = elements.mainCanvas.getBoundingClientRect();
        const canvasWidth = canvasRect.width;
        const canvasHeight = canvasRect.height;
        
        // 设置默认裁剪框大小（画布的80%）
        let boxWidth = canvasWidth * 0.8;
        let boxHeight = canvasHeight * 0.8;

        // 如果有固定比例，调整裁剪框
        if (state.cropRatio) {
            const [ratioWidth, ratioHeight] = state.cropRatio.split(':').map(Number);
            const aspectRatio = ratioWidth / ratioHeight;
            
            // 计算适合画布的最大尺寸
            if (boxWidth / boxHeight > aspectRatio) {
                boxWidth = boxHeight * aspectRatio;
            } else {
                boxHeight = boxWidth / aspectRatio;
            }
        }

        // 居中定位
        state.cropBox = {
            x: (canvasWidth - boxWidth) / 2,
            y: (canvasHeight - boxHeight) / 2,
            width: boxWidth,
            height: boxHeight
        };

        updateCropBoxDisplay();
    }

    // 更新裁剪框显示
    function updateCropBoxDisplay() {
        const box = state.cropBox;
        elements.cropBox.style.left = box.x + 'px';
        elements.cropBox.style.top = box.y + 'px';
        elements.cropBox.style.width = box.width + 'px';
        elements.cropBox.style.height = box.height + 'px';
    }

    // 应用裁剪
    function applyCrop() {
        if (!state.ctx || !state.isCropping) return;

        const canvasRect = elements.mainCanvas.getBoundingClientRect();
        const scaleX = state.canvas.width / canvasRect.width;
        const scaleY = state.canvas.height / canvasRect.height;

        // 计算实际像素坐标
        const cropX = Math.round(state.cropBox.x * scaleX);
        const cropY = Math.round(state.cropBox.y * scaleY);
        const cropWidth = Math.round(state.cropBox.width * scaleX);
        const cropHeight = Math.round(state.cropBox.height * scaleY);

        // 获取裁剪区域的图像数据
        const imageData = state.ctx.getImageData(cropX, cropY, cropWidth, cropHeight);

        // 创建新画布并绘制裁剪后的图像
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = cropWidth;
        tempCanvas.height = cropHeight;
        tempCtx.putImageData(imageData, 0, 0);

        // 更新主画布
        state.canvas.width = cropWidth;
        state.canvas.height = cropHeight;
        state.previewCanvas.width = cropWidth;
        state.previewCanvas.height = cropHeight;
        state.ctx.drawImage(tempCanvas, 0, 0);

        // 隐藏裁剪相关元素
        cancelCrop();

        // 保存状态
        saveState();
    }

    // 取消裁剪
    function cancelCrop() {
        state.isCropping = false;
        elements.cropOverlay.style.display = 'none';
        elements.startCropBtn.style.display = 'inline-block';
        elements.applyCropBtn.style.display = 'none';
        elements.cancelCropBtn.style.display = 'none';
    }

    // 设置裁剪框拖动
    function setupCropBoxDrag() {
        let isDragging = false;
        let startX, startY;
        let dragType = null;

        elements.cropBox.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isDragging = true;
            dragType = 'move';
            startX = e.clientX;
            startY = e.clientY;
        });

        document.querySelectorAll('.crop-handle').forEach(handle => {
            handle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                isDragging = true;
                dragType = e.target.dataset.handle;
                startX = e.clientX;
                startY = e.clientY;
            });
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging || !state.isCropping) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            const canvasRect = elements.mainCanvas.getBoundingClientRect();

            if (dragType === 'move') {
                // 移动裁剪框
                let newX = state.cropBox.x + dx;
                let newY = state.cropBox.y + dy;

                // 边界检查
                newX = Math.max(0, Math.min(newX, canvasRect.width - state.cropBox.width));
                newY = Math.max(0, Math.min(newY, canvasRect.height - state.cropBox.height));

                state.cropBox.x = newX;
                state.cropBox.y = newY;
            } else {
                // 调整大小
                let newX = state.cropBox.x;
                let newY = state.cropBox.y;
                let newWidth = state.cropBox.width;
                let newHeight = state.cropBox.height;

                // 根据手柄位置计算新的尺寸和位置
                switch (dragType) {
                    case 'nw':
                        newX += dx;
                        newY += dy;
                        newWidth -= dx;
                        newHeight -= dy;
                        break;
                    case 'n':
                        newY += dy;
                        newHeight -= dy;
                        break;
                    case 'ne':
                        newY += dy;
                        newWidth += dx;
                        newHeight -= dy;
                        break;
                    case 'e':
                        newWidth += dx;
                        break;
                    case 'se':
                        newWidth += dx;
                        newHeight += dy;
                        break;
                    case 's':
                        newHeight += dy;
                        break;
                    case 'sw':
                        newX += dx;
                        newWidth -= dx;
                        newHeight += dy;
                        break;
                    case 'w':
                        newX += dx;
                        newWidth -= dx;
                        break;
                }

                // 如果有固定比例，保持比例
                if (state.cropRatio) {
                    const [ratioWidth, ratioHeight] = state.cropRatio.split(':').map(Number);
                    const aspectRatio = ratioWidth / ratioHeight;
                    
                    // 根据宽高比调整
                    if (Math.abs(dx) > Math.abs(dy)) {
                        newHeight = newWidth / aspectRatio;
                    } else {
                        newWidth = newHeight * aspectRatio;
                    }
                }

                // 最小尺寸限制
                const minSize = 50;
                if (newWidth >= minSize && newHeight >= minSize) {
                    // 边界检查
                    if (newX < 0) {
                        newWidth += newX;
                        newX = 0;
                    }
                    if (newY < 0) {
                        newHeight += newY;
                        newY = 0;
                    }
                    if (newX + newWidth > canvasRect.width) {
                        newWidth = canvasRect.width - newX;
                    }
                    if (newY + newHeight > canvasRect.height) {
                        newHeight = canvasRect.height - newY;
                    }

                    state.cropBox.x = newX;
                    state.cropBox.y = newY;
                    state.cropBox.width = newWidth;
                    state.cropBox.height = newHeight;
                }
            }

            startX = e.clientX;
            startY = e.clientY;
            updateCropBoxDisplay();
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            dragType = null;
        });
    }

    // 预览调整效果
    function previewAdjustments() {
        if (!state.ctx) return;

        // 从历史中获取当前状态作为基础
        const currentState = state.history[state.historyIndex];
        if (!currentState) return;

        // 先恢复原始图像数据
        state.previewCtx.putImageData(currentState.imageData, 0, 0);

        // 获取图像数据进行处理
        const imageData = state.previewCtx.getImageData(0, 0, state.previewCanvas.width, state.previewCanvas.height);
        const data = imageData.data;

        // 应用亮度调整
        const brightness = state.adjustments.brightness / 100; // 转换为-1到1之间的值
        const contrast = (state.adjustments.contrast + 100) / 100; // 转换为0到2之间的值
        const saturation = (state.adjustments.saturation + 100) / 100; // 转换为0到2之间的值

        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            // 亮度调整
            if (brightness !== 0) {
                r += brightness * 255;
                g += brightness * 255;
                b += brightness * 255;
            }

            // 对比度调整
            if (contrast !== 1) {
                r = ((r / 255 - 0.5) * contrast + 0.5);
                g = ((g / 255 - 0.5) * contrast + 0.5);
                b = ((b / 255 - 0.5) * contrast + 0.5);
                r *= 255;
                g *= 255;
                b *= 255;
            }

            // 饱和度调整
            if (saturation !== 1) {
                const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
                r = gray + (r - gray) * saturation;
                g = gray + (g - gray) * saturation;
                b = gray + (b - gray) * saturation;
            }

            // 限制在0-255范围内
            data[i] = Math.max(0, Math.min(255, r));
            data[i + 1] = Math.max(0, Math.min(255, g));
            data[i + 2] = Math.max(0, Math.min(255, b));
        }

        // 放回图像数据
        state.previewCtx.putImageData(imageData, 0, 0);

        // 显示预览
        state.ctx.drawImage(state.previewCanvas, 0, 0);
    }

    // 应用调整
    function applyAdjustments() {
        if (!state.ctx) return;

        // 检查是否有调整
        if (state.adjustments.brightness === 0 && 
            state.adjustments.contrast === 0 && 
            state.adjustments.saturation === 0) {
            return;
        }

        // 从历史中获取当前状态作为基础
        const currentState = state.history[state.historyIndex];
        if (!currentState) return;

        // 先恢复原始图像数据
        state.ctx.putImageData(currentState.imageData, 0, 0);

        // 获取图像数据进行处理
        const imageData = state.ctx.getImageData(0, 0, state.canvas.width, state.canvas.height);
        const data = imageData.data;

        // 应用亮度调整
        const brightness = state.adjustments.brightness / 100; // 转换为-1到1之间的值
        const contrast = (state.adjustments.contrast + 100) / 100; // 转换为0到2之间的值
        const saturation = (state.adjustments.saturation + 100) / 100; // 转换为0到2之间的值

        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            // 亮度调整
            if (brightness !== 0) {
                r += brightness * 255;
                g += brightness * 255;
                b += brightness * 255;
            }

            // 对比度调整
            if (contrast !== 1) {
                r = ((r / 255 - 0.5) * contrast + 0.5);
                g = ((g / 255 - 0.5) * contrast + 0.5);
                b = ((b / 255 - 0.5) * contrast + 0.5);
                r *= 255;
                g *= 255;
                b *= 255;
            }

            // 饱和度调整
            if (saturation !== 1) {
                const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
                r = gray + (r - gray) * saturation;
                g = gray + (g - gray) * saturation;
                b = gray + (b - gray) * saturation;
            }

            // 限制在0-255范围内
            data[i] = Math.max(0, Math.min(255, r));
            data[i + 1] = Math.max(0, Math.min(255, g));
            data[i + 2] = Math.max(0, Math.min(255, b));
        }

        // 放回图像数据
        state.ctx.putImageData(imageData, 0, 0);

        // 保存状态
        saveState();

        // 重置调整值
        resetAdjustments();
    }

    // 重置调整
    function resetAdjustments() {
        state.adjustments = {
            brightness: 0,
            contrast: 0,
            saturation: 0
        };

        elements.brightnessSlider.value = 0;
        elements.brightnessValue.textContent = '0';
        elements.contrastSlider.value = 0;
        elements.contrastValue.textContent = '0';
        elements.saturationSlider.value = 0;
        elements.saturationValue.textContent = '0';

        // 恢复原始图像
        if (state.historyIndex >= 0) {
            const currentState = state.history[state.historyIndex];
            if (currentState) {
                state.ctx.putImageData(currentState.imageData, 0, 0);
            }
        }
    }

    // 添加文字水印
    function addWatermark() {
        if (!state.ctx) return;

        const text = elements.watermarkText.value.trim();
        if (!text) {
            alert('请输入水印文字');
            return;
        }

        const fontSize = parseInt(elements.watermarkFontSize.value);
        const color = elements.watermarkColor.value;
        const opacity = parseFloat(elements.watermarkOpacity.value);
        const position = elements.watermarkPosition.value;

        // 设置字体
        state.ctx.font = `${fontSize}px Arial, sans-serif`;
        state.ctx.fillStyle = color;
        state.ctx.globalAlpha = opacity;
        state.ctx.textBaseline = 'top';

        // 计算文字大小
        const metrics = state.ctx.measureText(text);
        const textWidth = metrics.width;
        const textHeight = fontSize;

        // 计算位置
        let x, y;
        const padding = 20;
        const canvasWidth = state.canvas.width;
        const canvasHeight = state.canvas.height;

        switch (position) {
            case 'top-left':
                x = padding;
                y = padding;
                break;
            case 'top-center':
                x = (canvasWidth - textWidth) / 2;
                y = padding;
                break;
            case 'top-right':
                x = canvasWidth - textWidth - padding;
                y = padding;
                break;
            case 'center-left':
                x = padding;
                y = (canvasHeight - textHeight) / 2;
                break;
            case 'center':
                x = (canvasWidth - textWidth) / 2;
                y = (canvasHeight - textHeight) / 2;
                break;
            case 'center-right':
                x = canvasWidth - textWidth - padding;
                y = (canvasHeight - textHeight) / 2;
                break;
            case 'bottom-left':
                x = padding;
                y = canvasHeight - textHeight - padding;
                break;
            case 'bottom-center':
                x = (canvasWidth - textWidth) / 2;
                y = canvasHeight - textHeight - padding;
                break;
            case 'bottom-right':
                x = canvasWidth - textWidth - padding;
                y = canvasHeight - textHeight - padding;
                break;
        }

        // 绘制文字
        state.ctx.fillText(text, x, y);

        // 恢复透明度
        state.ctx.globalAlpha = 1;

        // 保存状态
        saveState();
    }

    // 开始马赛克
    function startMosaic() {
        if (!state.ctx) return;

        state.isMosaicking = true;
        elements.startMosaicBtn.style.display = 'none';
        elements.stopMosaicBtn.style.display = 'inline-block';
    }

    // 停止马赛克
    function stopMosaic() {
        if (!state.isMosaicking) return;

        state.isMosaicking = false;
        elements.startMosaicBtn.style.display = 'inline-block';
        elements.stopMosaicBtn.style.display = 'none';

        // 保存状态
        saveState();
    }

    // 画布鼠标事件处理
    let isDrawingMosaic = false;

    function handleCanvasMouseDown(e) {
        if (!state.isMosaicking) return;
        isDrawingMosaic = true;
        applyMosaic(e);
    }

    function handleCanvasMouseMove(e) {
        if (!isDrawingMosaic) return;
        applyMosaic(e);
    }

    function handleCanvasMouseUp() {
        isDrawingMosaic = false;
    }

    // 应用马赛克
    function applyMosaic(e) {
        if (!state.ctx) return;

        const canvasRect = state.canvas.getBoundingClientRect();
        const scaleX = state.canvas.width / canvasRect.width;
        const scaleY = state.canvas.height / canvasRect.height;

        // 计算鼠标在画布上的位置
        const x = (e.clientX - canvasRect.left) * scaleX;
        const y = (e.clientY - canvasRect.top) * scaleY;

        // 计算画笔区域
        const brushSize = state.mosaicBrushSize;
        const startX = Math.max(0, x - brushSize / 2);
        const startY = Math.max(0, y - brushSize / 2);
        const endX = Math.min(state.canvas.width, x + brushSize / 2);
        const endY = Math.min(state.canvas.height, y + brushSize / 2);

        // 获取图像数据
        const imageData = state.ctx.getImageData(
            Math.floor(startX),
            Math.floor(startY),
            Math.ceil(endX - startX),
            Math.ceil(endY - startY)
        );
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;

        // 应用马赛克效果
        const blockSize = state.mosaicSize;

        for (let blockY = 0; blockY < height; blockY += blockSize) {
            for (let blockX = 0; blockX < width; blockX += blockSize) {
                // 计算块的平均颜色
                let totalR = 0, totalG = 0, totalB = 0, count = 0;

                for (let py = blockY; py < blockY + blockSize && py < height; py++) {
                    for (let px = blockX; px < blockX + blockSize && px < width; px++) {
                        const i = (py * width + px) * 4;
                        totalR += data[i];
                        totalG += data[i + 1];
                        totalB += data[i + 2];
                        count++;
                    }
                }

                // 平均颜色
                const avgR = Math.round(totalR / count);
                const avgG = Math.round(totalG / count);
                const avgB = Math.round(totalB / count);

                // 应用平均颜色到整个块
                for (let py = blockY; py < blockY + blockSize && py < height; py++) {
                    for (let px = blockX; px < blockX + blockSize && px < width; px++) {
                        const i = (py * width + px) * 4;
                        data[i] = avgR;
                        data[i + 1] = avgG;
                        data[i + 2] = avgB;
                    }
                }
            }
        }

        // 放回图像数据
        state.ctx.putImageData(imageData, Math.floor(startX), Math.floor(startY));
    }

    // 显示导出面板
    function showExportPanel() {
        elements.exportPanel.style.display = 'block';
        updateQualityControl();
    }

    // 隐藏导出面板
    function hideExportPanel() {
        elements.exportPanel.style.display = 'none';
    }

    // 更新质量控制显示
    function updateQualityControl() {
        if (elements.exportFormat.value === 'image/jpeg') {
            elements.qualityControl.style.display = 'block';
        } else {
            elements.qualityControl.style.display = 'none';
        }
        elements.qualityValue.textContent = elements.exportQuality.value;
    }

    // 导出图像
    function exportImage() {
        if (!state.canvas) return;

        const format = elements.exportFormat.value;
        const quality = parseFloat(elements.exportQuality.value);
        const filename = elements.exportFilename.value.trim() || 'edited-image';

        // 生成数据URL
        let dataUrl;
        if (format === 'image/jpeg') {
            dataUrl = state.canvas.toDataURL(format, quality);
        } else {
            dataUrl = state.canvas.toDataURL(format);
        }

        // 创建下载链接
        const link = document.createElement('a');
        link.download = `${filename}.${format === 'image/png' ? 'png' : 'jpg'}`;
        link.href = dataUrl;
        link.click();

        // 隐藏导出面板
        hideExportPanel();
    }

    // 初始化应用
    init();
})();
