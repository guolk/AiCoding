const MockData = {
    generateSamplePhotos() {
        const samplePhotos = [
            {
                filename: 'portrait_sunset_01.jpg',
                rating: 5,
                tags: ['人像', '日系'],
                noteIds: [],
                exif: {
                    dateTime: '2025-06-15T18:30:00',
                    make: 'SONY',
                    model: 'ILCE-7M4',
                    lens: 'FE 85mm F1.8',
                    aperture: 1.8,
                    shutterSpeed: 1/200,
                    iso: 100,
                    focalLength: 85
                }
            },
            {
                filename: 'landscape_mountain_01.jpg',
                rating: 5,
                tags: ['风光', 'HDR'],
                noteIds: [],
                exif: {
                    dateTime: '2025-07-20T06:15:00',
                    make: 'SONY',
                    model: 'ILCE-7M4',
                    lens: 'FE 24-70mm F2.8 GM',
                    aperture: 8,
                    shutterSpeed: 1/125,
                    iso: 100,
                    focalLength: 35
                }
            },
            {
                filename: 'street_night_01.jpg',
                rating: 4,
                tags: ['街头', '黑白'],
                noteIds: [],
                exif: {
                    dateTime: '2025-08-10T21:45:00',
                    make: 'FUJIFILM',
                    model: 'X-T5',
                    lens: 'XF 23mm F1.4',
                    aperture: 2,
                    shutterSpeed: 1/60,
                    iso: 800,
                    focalLength: 23
                }
            },
            {
                filename: 'still_life_coffee_01.jpg',
                rating: 4,
                tags: ['静物', '低饱和'],
                noteIds: [],
                exif: {
                    dateTime: '2025-09-05T14:20:00',
                    make: 'SONY',
                    model: 'ILCE-7M4',
                    lens: 'FE 90mm F2.8 Macro',
                    aperture: 4,
                    shutterSpeed: 1/200,
                    iso: 200,
                    focalLength: 90
                }
            },
            {
                filename: 'architecture_city_01.jpg',
                rating: 4,
                tags: ['建筑', '高对比'],
                noteIds: [],
                exif: {
                    dateTime: '2025-09-18T11:30:00',
                    make: 'SONY',
                    model: 'ILCE-7M4',
                    lens: 'FE 16-35mm F2.8 GM',
                    aperture: 8,
                    shutterSpeed: 1/250,
                    iso: 100,
                    focalLength: 24
                }
            },
            {
                filename: 'portrait_indoor_01.jpg',
                rating: 5,
                tags: ['人像', '日系'],
                noteIds: [],
                exif: {
                    dateTime: '2025-10-12T16:00:00',
                    make: 'SONY',
                    model: 'ILCE-7M4',
                    lens: 'FE 50mm F1.4 GM',
                    aperture: 1.8,
                    shutterSpeed: 1/160,
                    iso: 400,
                    focalLength: 50
                }
            },
            {
                filename: 'landscape_sunrise_01.jpg',
                rating: 5,
                tags: ['风光'],
                noteIds: [],
                exif: {
                    dateTime: '2025-11-05T05:45:00',
                    make: 'SONY',
                    model: 'ILCE-7M4',
                    lens: 'FE 16-35mm F2.8 GM',
                    aperture: 11,
                    shutterSpeed: 1/30,
                    iso: 100,
                    focalLength: 16
                }
            },
            {
                filename: 'street_market_01.jpg',
                rating: 3,
                tags: ['街头', '纪实'],
                noteIds: [],
                exif: {
                    dateTime: '2025-11-20T09:15:00',
                    make: 'FUJIFILM',
                    model: 'X-T5',
                    lens: 'XF 35mm F1.4',
                    aperture: 4,
                    shutterSpeed: 1/250,
                    iso: 400,
                    focalLength: 35
                }
            },
            {
                filename: 'portrait_studio_01.jpg',
                rating: 5,
                tags: ['人像'],
                noteIds: [],
                exif: {
                    dateTime: '2025-12-01T14:00:00',
                    make: 'SONY',
                    model: 'ILCE-7M4',
                    lens: 'FE 85mm F1.4 GM',
                    aperture: 2.8,
                    shutterSpeed: 1/200,
                    iso: 100,
                    focalLength: 85
                }
            },
            {
                filename: 'landscape_waterfall_01.jpg',
                rating: 4,
                tags: ['风光'],
                noteIds: [],
                exif: {
                    dateTime: '2025-12-15T08:30:00',
                    make: 'SONY',
                    model: 'ILCE-7M4',
                    lens: 'FE 24-70mm F2.8 GM',
                    aperture: 8,
                    shutterSpeed: 0.5,
                    iso: 100,
                    focalLength: 24
                }
            },
            {
                filename: 'street_bw_01.jpg',
                rating: 4,
                tags: ['街头', '黑白'],
                noteIds: [],
                exif: {
                    dateTime: '2026-01-08T19:45:00',
                    make: 'FUJIFILM',
                    model: 'X-T5',
                    lens: 'XF 23mm F1.4',
                    aperture: 2.8,
                    shutterSpeed: 1/125,
                    iso: 1600,
                    focalLength: 23
                }
            },
            {
                filename: 'still_life_flowers_01.jpg',
                rating: 4,
                tags: ['静物'],
                noteIds: [],
                exif: {
                    dateTime: '2026-01-25T10:00:00',
                    make: 'SONY',
                    model: 'ILCE-7M4',
                    lens: 'FE 90mm F2.8 Macro',
                    aperture: 5.6,
                    shutterSpeed: 1/160,
                    iso: 200,
                    focalLength: 90
                }
            },
            {
                filename: 'portrait_outdoor_01.jpg',
                rating: 5,
                tags: ['人像', '日系'],
                noteIds: [],
                exif: {
                    dateTime: '2026-02-14T17:30:00',
                    make: 'SONY',
                    model: 'ILCE-7M4',
                    lens: 'FE 50mm F1.4 GM',
                    aperture: 2,
                    shutterSpeed: 1/320,
                    iso: 100,
                    focalLength: 50
                }
            },
            {
                filename: 'landscape_sea_01.jpg',
                rating: 5,
                tags: ['风光', 'HDR'],
                noteIds: [],
                exif: {
                    dateTime: '2026-03-20T06:00:00',
                    make: 'SONY',
                    model: 'ILCE-7M4',
                    lens: 'FE 16-35mm F2.8 GM',
                    aperture: 11,
                    shutterSpeed: 1/60,
                    iso: 100,
                    focalLength: 20
                }
            },
            {
                filename: 'street_rain_01.jpg',
                rating: 4,
                tags: ['街头', '高对比'],
                noteIds: [],
                exif: {
                    dateTime: '2026-04-10T20:15:00',
                    make: 'FUJIFILM',
                    model: 'X-T5',
                    lens: 'XF 35mm F1.4',
                    aperture: 2.8,
                    shutterSpeed: 1/60,
                    iso: 3200,
                    focalLength: 35
                }
            },
            {
                filename: 'architecture_bridge_01.jpg',
                rating: 5,
                tags: ['建筑', '风光'],
                noteIds: [],
                exif: {
                    dateTime: '2026-04-25T15:45:00',
                    make: 'SONY',
                    model: 'ILCE-7M4',
                    lens: 'FE 24-70mm F2.8 GM',
                    aperture: 8,
                    shutterSpeed: 1/200,
                    iso: 100,
                    focalLength: 35
                }
            },
            {
                filename: 'portrait_couple_01.jpg',
                rating: 5,
                tags: ['人像'],
                noteIds: [],
                exif: {
                    dateTime: '2026-05-01T16:30:00',
                    make: 'SONY',
                    model: 'ILCE-7M4',
                    lens: 'FE 85mm F1.4 GM',
                    aperture: 2,
                    shutterSpeed: 1/250,
                    iso: 200,
                    focalLength: 85
                }
            },
            {
                filename: 'still_life_fruit_01.jpg',
                rating: 3,
                tags: ['静物', '低饱和'],
                noteIds: [],
                exif: {
                    dateTime: '2026-05-10T11:00:00',
                    make: 'SONY',
                    model: 'ILCE-7M4',
                    lens: 'FE 90mm F2.8 Macro',
                    aperture: 8,
                    shutterSpeed: 1/125,
                    iso: 100,
                    focalLength: 90
                }
            }
        ];

        const colors = [
            ['FF6B6B', '4ECDC4'],
            ['45B7D1', '96CEB4'],
            ['FFEAA7', 'DDA0DD'],
            ['98D8C8', 'F7DC6F'],
            ['BB8FCE', '85C1E9'],
            ['F8B500', 'FF6F61'],
            ['2ECC71', '3498DB'],
            ['E74C3C', 'F39C12'],
            ['9B59B6', '1ABC9C'],
            ['E67E22', '34495E'],
            ['16A085', 'C0392B'],
            ['D35400', '7F8C8D'],
            ['27AE60', '2980B9'],
            ['8E44AD', '16A085'],
            ['F1C40F', 'E67E22'],
            ['2C3E50', '27AE60'],
            ['D35400', '34495E'],
            ['1ABC9C', 'F39C12']
        ];

        return samplePhotos.map((photo, index) => {
            const color = colors[index % colors.length];
            return {
                id: `mock_${index + 1}`,
                dataUrl: this.generatePlaceholderImage(color[0], color[1], photo.filename),
                filename: photo.filename,
                importedAt: photo.exif.dateTime,
                rating: photo.rating,
                tags: photo.tags.map(tagName => {
                    const tag = Storage.getTags().find(t => t.name === tagName);
                    return tag ? tag.id : null;
                }).filter(Boolean),
                noteIds: [],
                exif: photo.exif
            };
        });
    },

    generatePlaceholderImage(color1, color2, text) {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createLinearGradient(0, 0, 600, 400);
        gradient.addColorStop(0, `#${color1}`);
        gradient.addColorStop(1, `#${color2}`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 600, 400);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 300, 180);

        ctx.font = '14px Arial';
        ctx.fillText('Sample Photo', 300, 220);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 20, 560, 360);

        return canvas.toDataURL('image/jpeg', 0.8);
    },

    generateSampleNotes() {
        return [
            {
                id: 'mock_note_1',
                title: '理解对焦模式',
                category: '对焦',
                level: '入门',
                keyPoints: ['AF-S单次对焦适合静止主体', 'AF-C连续对焦适合运动主体', '手动对焦在特殊场景下更精准'],
                content: '对焦是摄影最基础的技术之一。现代相机提供了多种对焦模式，了解何时使用哪种模式至关重要。AF-S单次自动对焦适合拍摄静止的物体，如风景和静物。AF-C连续自动对焦则适合拍摄运动中的主体，如体育和野生动物。手动对焦虽然慢，但在低光或特殊场景下可以提供更精准的控制。',
                createdAt: '2025-06-01T00:00:00'
            },
            {
                id: 'mock_note_2',
                title: '曝光三角的关系',
                category: '曝光',
                level: '入门',
                keyPoints: ['光圈控制景深和进光量', '快门控制运动模糊和进光量', 'ISO控制噪点和灵敏度'],
                content: '曝光三角由光圈、快门速度和ISO组成。光圈越大（数值越小），进光量越多，景深越浅。快门速度越快，进光量越少，但可以冻结运动。ISO越高，传感器越敏感，但噪点也越多。三者需要平衡以获得正确的曝光。',
                createdAt: '2025-06-15T00:00:00'
            },
            {
                id: 'mock_note_3',
                title: '三分法构图',
                category: '构图',
                level: '入门',
                keyPoints: ['将画面分成3x3网格', '重要元素放在交叉点上', '地平线放在上或下三分线'],
                content: '三分法是最基础也最实用的构图法则。想象画面被两条横线和两条竖线分成九个等分的格子。将重要的视觉元素放在这些线条的交叉点上，可以使画面更加平衡和吸引人。拍摄风景时，将地平线放在上方或下方的三分线上，可以强调天空或地面。',
                createdAt: '2025-07-01T00:00:00'
            },
            {
                id: 'mock_note_4',
                title: '自然光的运用',
                category: '用光',
                level: '进阶',
                keyPoints: ['黄金时段光线最柔和', '逆光可创造剪影效果', '侧光最能突出纹理'],
                content: '自然光摄影中，光线的质量和方向至关重要。日出后和日落前的黄金时段，光线柔和温暖，最适合拍摄人像。正午的硬光会造成强烈的阴影，需要避免或使用补光。侧光能很好地突出物体的纹理和立体感，是风光摄影的理想选择。',
                createdAt: '2025-08-10T00:00:00'
            },
            {
                id: 'mock_note_5',
                title: 'RAW格式处理基础',
                category: '后期',
                level: '进阶',
                keyPoints: ['RAW保留更多画面信息', '白平衡可在后期调整', '曝光有更大的调整空间'],
                content: 'RAW格式记录了传感器的原始数据，相比JPEG保留了更多的细节和动态范围。在后期处理中，你可以自由调整白平衡、曝光、对比度等参数而不会损失画质。建议使用Lightroom或Capture One等专业软件进行RAW处理。',
                createdAt: '2025-09-20T00:00:00'
            },
            {
                id: 'mock_note_6',
                title: '眼部对焦技巧',
                category: '对焦',
                level: '进阶',
                keyPoints: ['人像优先对焦眼睛', '使用眼控对焦功能', '大光圈时对焦精度更重要'],
                content: '拍摄人像时，眼睛是最重要的焦点。现代相机的眼控对焦功能可以自动检测并对焦到眼睛，大大提高了拍摄成功率。使用大光圈拍摄时，景深非常浅，更需要精确的对焦。建议使用单点对焦并放大确认焦点。',
                createdAt: '2025-10-15T00:00:00'
            }
        ];
    },

    generateSamplePlans() {
        return [
            {
                id: 'mock_plan_1',
                title: '练习逆光人像',
                date: '2026-06-01',
                status: 'planned',
                skill: '逆光拍摄、反光板使用',
                location: '城市公园',
                notes: '准备反光板和闪光灯，选择下午4点左右的光线'
            },
            {
                id: 'mock_plan_2',
                title: '慢门水流练习',
                date: '2026-06-15',
                status: 'planned',
                skill: '长时间曝光、三脚架使用',
                location: '附近溪流',
                notes: '需要ND减光镜，快门速度目标1-2秒'
            },
            {
                id: 'mock_plan_3',
                title: '城市街拍',
                date: '2026-05-20',
                status: 'completed',
                skill: '抓拍、街头构图',
                location: '老城区',
                notes: '使用35mm定焦镜头，保持低调'
            },
            {
                id: 'mock_plan_4',
                title: '星空摄影',
                date: '2026-07-10',
                status: 'planned',
                skill: '高ISO、长曝光',
                location: '郊外无光污染地区',
                notes: '需要晴朗的夜空，使用三脚架和快门线'
            }
        ];
    },

    generateSampleCameras() {
        return [
            {
                id: 'mock_cam_1',
                brand: 'SONY',
                model: 'ILCE-7M4',
                purchaseDate: '2024-03-15',
                sensor: '全画幅',
                notes: '主力相机，约3300万像素'
            },
            {
                id: 'mock_cam_2',
                brand: 'FUJIFILM',
                model: 'X-T5',
                purchaseDate: '2025-01-20',
                sensor: 'APS-C',
                notes: '随身相机，轻便好用'
            }
        ];
    },

    generateSampleLenses() {
        return [
            {
                id: 'mock_lens_1',
                brand: 'SONY',
                model: 'FE 16-35mm F2.8 GM',
                focalMin: 16,
                focalMax: 35,
                aperture: 'f/2.8',
                purchaseDate: '2024-04-10',
                notes: '广角变焦，风光主力'
            },
            {
                id: 'mock_lens_2',
                brand: 'SONY',
                model: 'FE 24-70mm F2.8 GM II',
                focalMin: 24,
                focalMax: 70,
                aperture: 'f/2.8',
                purchaseDate: '2024-04-10',
                notes: '标准变焦，日常挂机'
            },
            {
                id: 'mock_lens_3',
                brand: 'SONY',
                model: 'FE 85mm F1.4 GM',
                focalMin: 85,
                focalMax: 85,
                aperture: 'f/1.4',
                purchaseDate: '2024-06-20',
                notes: '人像定焦，虚化效果好'
            },
            {
                id: 'mock_lens_4',
                brand: 'SONY',
                model: 'FE 90mm F2.8 Macro',
                focalMin: 90,
                focalMax: 90,
                aperture: 'f/2.8',
                purchaseDate: '2025-02-15',
                notes: '微距镜头，静物摄影'
            }
        ];
    },

    loadMockData() {
        if (Storage.getPhotos().length > 0) {
            return false;
        }

        const photos = this.generateSamplePhotos();
        photos.forEach(photo => Storage.savePhoto(photo));

        const notes = this.generateSampleNotes();
        notes.forEach(note => Storage.saveNote(note));

        const plans = this.generateSamplePlans();
        plans.forEach(plan => Storage.savePlan(plan));

        const cameras = this.generateSampleCameras();
        cameras.forEach(camera => Storage.saveCamera(camera));

        const lenses = this.generateSampleLenses();
        lenses.forEach(lens => Storage.saveLens(lens));

        Storage.saveSkills({
            对焦: 75,
            曝光: 65,
            构图: 70,
            用光: 55,
            后期: 60
        });

        return true;
    }
};
