const gulp = require("gulp");
const gulpPlumber = require("gulp-plumber");
const gulpAutoprefixer = require("gulp-autoprefixer");
const gulpSass = require("gulp-sass");
const gulpRename = require("gulp-rename");
const gulpUglify = require("gulp-uglify-es").default;
const gulpSourcemaps = require("gulp-sourcemaps");
const gulpNotify = require("gulp-notify");
const gulpIf = require("gulp-if");
const mergeStream = require("merge-stream");
const browsersync = require("browser-sync");
const browserSync = browsersync.create();
const browserify = require("browserify");
const watchify = require("watchify");
const babelify = require("babelify");
const gulpSource = require("vinyl-source-stream");
const eventStream = require("event-stream");
const buffer = require("vinyl-buffer");
const path = require("path");
const gulpOptions = require("./gulpfile.options");

/**
 * Will be inserted as ptions for node-sass
 * @link https://github.com/sass/node-sass#options
 */
const sassOptions = {
    errLogToConsole: true,
    precision: 8,
    noCache: true
};

/**
 * To run javascript bundler
 * complete with modern ES and browserlist support
 *
 * @param {browserify() | watchify()} bundler
 * @param {String | Object} source
 */
function runJsBundler(bundler, source) {
    return function() {
        const { sourcemap, minify, distFolder } = gulpOptions.javascript;
        const isSingle = typeof source === "string" ? true : false;
        const file = isSingle ? path.basename(source) : source.name + ".js";
        const fileMin = isSingle
            ? path.basename(file, ".js") + ".min.js"
            : source.name + ".min.js";
        const onError = function(err) {
            console.log("\x1b[37m\x1b[41m\n");
            console.log("     Javascript Error!");
            console.log("\x1b[0m\n");
            console.log(err.message);
        };
        const onSuccess = gulpNotify({
            title: "Javascript",
            message: file + " Compiled!",
            onLast: true
        });

        return bundler
            .bundle()
            .on("error", onError)
            .pipe(gulpIf(minify, gulpSource(fileMin), gulpSource(file)))
            .pipe(buffer())
            .pipe(gulpIf(minify, gulpUglify()))
            .pipe(gulpSourcemaps.init({ loadMaps: sourcemap }))
            .pipe(gulpIf(sourcemap, gulpSourcemaps.write(".")))
            .pipe(gulp.dest(distFolder))
            .pipe(onSuccess);
    };
}

/**
 * SASS Compiler, without watcher
 */
gulp.task("compile-sass", function() {
    const { sourcemap, minify, src, distFolder } = gulpOptions.sass;
    const _sassOptions = {
        ...sassOptions,
        outputStyle: minify ? "compressed" : "nested"
    };
    const onSuccess = gulpNotify({
        title: "SASS",
        message: "All Compiled!",
        onLast: true
    });

    // Validate `src` options
    if (!src || !Array.isArray(src) || !src.length) return false;

    return gulp
        .src(src)
        .pipe(gulpIf(minify, gulpRename({ suffix: ".min" })))
        .pipe(gulpSourcemaps.init())
        .pipe(gulpPlumber())
        .pipe(gulpSass(_sassOptions))
        .pipe(gulpAutoprefixer())
        .pipe(gulpIf(sourcemap, gulpSourcemaps.write(".")))
        .pipe(gulp.dest(distFolder))
        .pipe(onSuccess);
});

/**
 * SASS Watcher
 * it will run compiler first and then watch for file changes
 */
gulp.task("watch-sass", function() {
    const { watch } = gulpOptions.sass;

    // Validate `watch` options
    if (!watch || !Array.isArray(watch) || !watch.length) return false;

    gulp.watch(watch, gulp.series("compile-sass"));
});

/**
 * JS Watcher
 * it will run compiler first and then watch for file changes
 */
gulp.task("watch-js", function() {
    const { sourcemap, src } = gulpOptions.javascript;

    // Validate `src` options
    if (!src || !Array.isArray(src) || !src.length) return false;

    const stream = src.map(function(_file) {
        const file = typeof _file === "string" ? _file : _file.src;
        const bundler = watchify(
            browserify(file, {
                debug: sourcemap
            }).transform(babelify)
        );
        const watchfn = runJsBundler(bundler, _file);

        bundler.on("update", watchfn);
        return watchfn();
    });

    return eventStream.merge(stream);
});

/**
 * JS Compile, without watcher
 */
gulp.task("compile-js", function() {
    const { sourcemap, src } = gulpOptions.javascript;

    // Validate `src` options
    if (!src || !Array.isArray(src) || !src.length) return false;

    const stream = src.map(function(_file) {
        const file = typeof _file === "string" ? _file : _file.src;
        const bundler = browserify(file, { debug: sourcemap }).transform(
            babelify
        );
        const _runBundler = runJsBundler(bundler, _file);

        return _runBundler();
    });

    return mergeStream(stream);
});

/**
 * Browsersync
 * Reload browser on file changes
 */
gulp.task("browser-sync", function() {
    const { config, watchFiles } = gulpOptions.browserSync;
    const _watchFiles = watchFiles || [];

    browserSync.init(_watchFiles, config);
    gulp.watch(_watchFiles).on("change", function() {
        browserSync.reload();
    });
});

/**
 * Default gulp command
 */
gulp.task(
    "default",
    gulp.parallel([
        gulp.series("watch-sass"),
        gulp.series("watch-js"),
        gulp.series("browser-sync")
    ])
);
