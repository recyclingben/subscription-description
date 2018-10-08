const 
    gulp = require('gulp'),
    cleanCss = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    uglifyEs = require('uglify-es'),
    composer = require('gulp-uglify/composer');

const minify = composer(uglifyEs, console);

gulp.task('minify:js', () => {
    return gulp.src('app/client/src/js/**/*.js')
        .pipe(minify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('app/client/dist/js'));
});

gulp.task('watch:js', () => {
    return gulp.watch('app/client/src/js/**/*.js', gulp.series('minify:js'));
});

gulp.task('compile:scss', () => {
    return gulp.src('app/client/src/scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('app/client/src/css'));
});

gulp.task('minify:css', () => {
    return gulp.src('app/client/src/css/**/*.css')
        .pipe(cleanCss())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('app/client/dist/css'));
});

gulp.task('watch:scss', () => {
    return gulp.watch('app/client/src/scss/**/*.scss', gulp.series('compile:scss', 'minify:css'));
});

gulp.task('default', gulp.parallel('watch:scss', 'watch:js'));