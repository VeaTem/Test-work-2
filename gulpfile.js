const { src, dest, watch, parallel, series } = require("gulp");
const scss = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat"); // Обеъденинение нескольких файлов в один
const uglify = require("gulp-uglify"); // Сжатие скриптов
const csso = require("gulp-csso"); // сжатие цсс
const cssClean = require("gulp-clean-css"); // сжатие цсс
const imagemin = require("gulp-imagemin"); // Сжатие картинок
const webp = require("gulp-webp"); // создание вебп
const webpcss = require("gulp-webpcss"); // класы вебп в цсс
// const webpNoSvg = require("gulp-webp-html"); // не обертывать свг
const webpNoSvg = require("gulp-webp-html-nosvg"); // не обертывать свг
// const webpNoSvg = require("gulp-webp-for-html"); // не обертывать свг
// const webpNoSvg = require("gulp-xv-webp-html"); // не обертывать свг
const size = require("gulp-size"); // сила сжатия
const notify = require("gulp-notify"); // объявления
const fs = require("fs");

const fonter = require("gulp-fonter"); // объявления
const ttf2Towoff2 = require("gulp-ttf2woff2"); // объявления

const del = require("del"); // удаление файлов
const gulpautoprefixer = require("gulp-autoprefixer");
const browserSync = require("browser-sync").create();

function syncBrowser() {
    browserSync.init({
        server: {
            baseDir: "app/",
        },
        notify: false,
    });
}

function styles() {
    return src("app/scss/style.scss")
        .pipe(size({ title: "ЦСС весил:" }))
        .pipe(scss({ outputStyle: "compressed" }).on("error", scss.logError))
        .pipe(webpcss())
        .pipe(concat("style.min.css"))
        .pipe(
            gulpautoprefixer({
                overrideBrowserslist: ["last 10 versions"],
                grid: true,
            })
        )
        .pipe(csso())
        .pipe(cssClean())
        .pipe(size({ title: "ЦСС весит:" }))
        .pipe(dest("app/css"))
        .pipe(browserSync.stream());
}

function scripts() {
    return src([
            "node_modules/jquery/dist/jquery.js",
            'node_modules/slick-carousel/slick/slick.js',
            "app/js/webpcheck.js",
            "app/js/main.js",
        ])
        .pipe(concat("main.min.js"))
        .pipe(size({ title: "JS before весит:" }))
        .pipe(uglify())
        .pipe(size({ title: "JS after весит:" }))
        .pipe(dest("app/js"))
        .pipe(browserSync.stream());
}


function fonts() {
    return src('app/fonts/**/*.*')
        .pipe(fonter({
            formats: ['ttf'],
        }))
        .pipe(dest('app/fonts'))
        .pipe(fonter({
            formats: ['woff'],
        }))
        .pipe(dest('app/fonts'))

}

function fonts2() {
    return src('app/fonts/**/*.*')
        .pipe(ttf2Towoff2())
        .pipe(dest('app/fonts'))
}


async function fontsStyle() {

    let fontsFile = "app/scss/fonts.scss";
    fs.readdir("app/fonts/", function(err, fontsFiles) {
        if (!fs.existsSync(fontsFile)) {
            fs.writeFile(fontsFile, '', cb);
            let newFileOnly;
            for (var i = 0; i < fontsFiles.length; i++) {
                let fontFileName = fontsFiles[i].split('.')[0];
                if (newFileOnly !== fontFileName) {
                    let fontName = fontFileName.split('-')[0] ? fontFileName.split('-')[0] : fontFileName;
                    let fontWeight = fontFileName.split('-')[1] ? fontFileName.split('-')[1] : fontFileName;
                    if (fontWeight.toLowerCase() === 'thin') {
                        fontWeight = 100;
                    } else if (fontWeight.toLowerCase() === 'extralight' || fontWeight.toLowerCase() === 'extralightitalic') {
                        fontWeight = 200;
                    } else if (fontWeight.toLowerCase() === 'light' || fontWeight.toLowerCase() === 'lightitalic') {
                        fontWeight = 300;
                    } else if (fontWeight.toLowerCase() === 'medium' || fontWeight.toLowerCase() === 'mediumitalic') {
                        fontWeight = 500;
                    } else if (fontWeight.toLowerCase() === 'semibold' || fontWeight.toLowerCase() === 'semibolditalic') {
                        fontWeight = 600;
                    } else if (fontWeight.toLowerCase() === 'bold' || fontWeight.toLowerCase() === 'bolditalic') {
                        fontWeight = 700;
                    } else if (fontWeight.toLowerCase() === 'extrabold' || fontWeight.toLowerCase() === 'extrabolditalic') {
                        fontWeight = 800;
                    } else if (fontWeight.toLowerCase() === 'black' || fontWeight.toLowerCase() === 'blackitalic') {
                        fontWeight = 900;
                    } else {
                        fontWeight = 400;
                    }
                    fs.appendFile(fontsFile,
                        `@font-face {
                         font-family: ${fontName};
                         font-display: swap;
                         src: url("../fonts/${fontFileName}.woff2") format("woff2"), url("../fonts/${fontFileName}.woff") format("woff");
                         font-weight: ${fontWeight};
                         font-style: normal;
                          }\r\n`, cb);
                    newFileOnly = fontFileName;

                }
            }


        } else {
            console.log('Файл scss/fonts.scss уже существует. для обновления его надо удалить')
        }
    });


    return ('app/')

    function cb() {}

}



function images() {
    return src("app/images/**/*.*")
        .pipe(webp())
        .pipe(dest("app/images/"))
        .pipe(size({ title: "IMG before весит:" }))
        .pipe(
            imagemin([
                imagemin.gifsicle({ interlaced: true }),
                imagemin.mozjpeg({ quality: 75, progressive: true }),
                imagemin.optipng({ optimizationLevel: 5 }),

            ])
        )
        .pipe(size({ title: "IMG after весит:" }))
        .pipe(dest("app/images/"));
}

function htmlWebp() {
    return src("dist/**/*.html")
        .pipe(webpNoSvg())
        .pipe(dest("dist"));
}



function build() {
    return src(["app/**/*.html", "app/images/**/*.*", "app/css/style.min.css", "app/js/main.min.js", "app/fonts/**/*.woff", "app/fonts/**/*.woff2"], {
        base: "app",
    })

    .pipe(dest("dist"));
}

function cleanDist() {
    return del("dist");
}


function watching() {
    watch(["app/scss/style.scss"], styles);
    watch(["app/js/**/*.js", "!app/js/main.min.js"], scripts);
    watch(["app/**/*.html"]).on("change", browserSync.reload);
}

exports.styles = styles;
exports.scripts = scripts;
exports.syncBrowser = syncBrowser;
exports.watching = watching;
exports.images = images;
exports.fonts = series(fonts, fonts2, fontsStyle)
exports.cleanDist = cleanDist;
exports.build = series(cleanDist, images, build, htmlWebp);
exports.default = parallel(images, styles, scripts, syncBrowser, watching);