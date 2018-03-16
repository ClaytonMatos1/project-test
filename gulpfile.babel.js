'use strict';

import gulp         from 'gulp';
import clean        from 'gulp-clean';
import concat       from 'gulp-concat';
import sourcemaps   from 'gulp-sourcemaps';
import browserify   from 'browserify';
import babelify     from 'babelify';
import vueify       from 'vueify';
import fs           from 'fs';
import shell        from 'gulp-shell';
import uglify       from 'gulp-uglify';
import browserSync  from 'browser-sync';

const paths = {
    src  : 'src',
    dist : 'dist'
};

gulp.task('default', ['map']);

gulp.task('clean', () => gulp.src(paths.dist).pipe(clean()));

gulp.task('dist', ['clean'], () => {
    return gulp.src('./')
        .pipe(shell('mkdir ' + paths.dist))
        .pipe(shell('cd dist && touch build.js'))
});

gulp.task('build', ['dist'], () => {
    return browserify({
            entries: [paths.src + '/main.js'],
            transform : ['vueify', 'babelify']
        })
        .bundle()
        .pipe(fs.createWriteStream(paths.dist + '/build.js'));
});

gulp.task('uglify', ['build'], () => {
    return gulp.src(paths.dist + '/build.js')
        .pipe(uglify())
        .pipe(gulp.dest(paths.dist));
})

gulp.task('map', ['uglify'], () => {
    return gulp.src(paths.dist + '/build.js')
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.dist));
});

gulp.task('server', ['uglify'], () => {
    browserSync.init({
        server : {
            baseDir : './'
        }
    });
    gulp.watch('src/**/*').on('change', (event) => {
        return browserify({
                entries: [paths.src + '/main.js'],
                transform : ['vueify', 'babelify']
            })
            .bundle()
            .pipe(fs.createWriteStream(paths.dist + '/build.js'));
    });
    gulp.watch('src/**/*').on('change', (event) => {
        setTimeout(() => browserSync.reload, 1000);
    });
});