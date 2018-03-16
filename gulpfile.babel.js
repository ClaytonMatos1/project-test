'use strict';

import gulp         from 'gulp';
import clean        from 'gulp-clean';
import sourcemaps   from 'gulp-sourcemaps';
import browserify   from 'browserify';
import fs           from 'fs';
import shell        from 'gulp-shell';
import uglify       from 'gulp-uglify';
import browserSync  from 'browser-sync';

const paths = {
    src  : 'src/',
    dist : 'dist/'
};
const fileDest = 'build.js';

gulp.task('default', ['map']);

gulp.task('map', ['uglify'], () => {
    return gulp.src(paths.dist + fileDest)
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.dist));
});

gulp.task('uglify', ['build'], () => {
    return gulp.src(paths.dist + fileDest)
        .pipe(uglify())
        .pipe(gulp.dest(paths.dist));
});

gulp.task('build', ['dist'], () => {
    return browserify({
            entries: [paths.src + 'main.js'],
            transform : ['vueify', 'babelify']
        })
        .bundle()
        .pipe(fs.createWriteStream(paths.dist + fileDest));
});

gulp.task('dist', ['clean'], () => {
    return gulp.src('./')
        .pipe(shell('mkdir dist'))
        .pipe(shell('cd dist && touch ' + fileDest));
});

gulp.task('clean', () => gulp.src(paths.dist).pipe(clean()));

gulp.task('server', ['map'], () => {
    browserSync.init({
        server : {
            baseDir : './'
        },
        reloadDelay: 500,
    });
    gulp.watch('src/**/*', ['refresh']).on('change', browserSync.reload);
});

gulp.task('refresh', () => {
    return browserify({
            entries: [paths.src + 'main.js'],
            transform : ['vueify', 'babelify']
        })
        .bundle()
        .pipe(fs.createWriteStream(paths.dist + fileDest));
});