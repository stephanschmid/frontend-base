var gulp = require('gulp');
var source = require('vinyl-source-stream'); // Used to stream bundle for further handling
var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');
var compass = require('gulp-compass');

gulp.task('browserify', function() {
    var bundler = browserify({
        entries: ['main.js'], // Only need initial file, browserify finds the deps
        transform: ['babelify'], // We want to convert JSX to normal javascript
        debug: true, // Gives us sourcemapping
        cache: {}, packageCache: {}, fullPaths: true // Requirement of watchify
    });

    var watcher  = watchify(bundler);

    return watcher
    .on('update', function () { // When any files update
        var updateStart = Date.now();
        console.log('Updating browserify!');
        watcher.bundle() // Create new bundle that uses the cache for high performance
        .on('error', function(err){
            console.log(err.message);
        })
        .pipe(source('main.js'))
        // This is where you add uglifying etc.
        .pipe(gulp.dest('./build/'));
        console.log('Updated browserify!', (Date.now() - updateStart) + 'ms');
    })
    .bundle() // Create the initial bundle when starting the task
    .on('error', function(err){
        console.log(err.message);
    })
    .pipe(source('main.js'))
    .pipe(gulp.dest('./build/'))
    ;
});

gulp.task('compass', function () {
    gulp.src('./assets/scss/main.scss')
        .pipe(compass({
            config_file: './config.rb',
            css: './assets/css',
            sass: './assets/scss'
        }))
        .pipe(gulp.dest('build'));
});

gulp.task('basic-style', function() {
    gulp.watch('./assets/scss/*/*.scss', ['compass']);
    gulp.watch('./assets/scss/main.scss', ['compass']);
});

gulp.task('component-style', function() {
    gulp.watch('./components/*/*.scss', ['compass']);
});


gulp.task('default', ['browserify', 'basic-style', 'component-style']);
