var gulp = require('gulp');
var clean = require('gulp-clean');
var ts = require('./release/main');

var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat-sourcemap');

var tsProject = ts.createProject({
	target: 'es5',
	module: 'commonjs',
	noExternalResolve: true
});

var paths = {
	scripts: ['lib/**.ts', 'definitions/**.ts'],
	releaseBeta: 'release-2',
	release: 'release'
};

gulp.task('clean', function() {
	gulp.src([paths.releaseBeta + '/*'], { read: false }).pipe(clean());
});
gulp.task('clean-test', function() {
	gulp.src(['test/output/*'], { read: false }).pipe(clean());
});
gulp.task('clean-release', function() {
	gulp.src([paths.release + '/*'], { read: false }).pipe(clean());
});

gulp.task('scripts', ['clean'], function() {
	var tsResult = gulp.src(paths.scripts)
					   .pipe(ts(tsProject));
	
	return tsResult.js.pipe(gulp.dest(paths.releaseBeta));
});

gulp.task('test-1', ['scripts', 'clean-test'], function() {
	var newTS = require('./release-2/main');
	var tsResult = gulp.src('test/test-1/*')
					   .pipe(sourcemaps.init())
					   .pipe(newTS({
						   declarationFiles: true,
						   noExternalResolve: true,
						   sortOutput: true
					   }));
	
	// tsResult.map.pipe(gulp.dest('test/output/test-1/map'));
	tsResult.dts.pipe(gulp.dest('test/output/test-1/dts'));
	// tsResult.js.pipe(sourcemaps.write()).pipe(gulp.dest('test/output/test-1/js'));

	return tsResult.js.pipe(concat('concat.js'))
						.pipe(sourcemaps.write({ includeContent: false, sourceRoot: '../../../test-1/' }))
						.pipe(gulp.dest('test/output/test-1/js'));
});
gulp.task('test-2', ['scripts', 'clean-test'], function() { // Test external resolve.
	var newTS = require('./release-2/main');
	var tsResult = gulp.src('test/test-2/test-2.ts')
					   .pipe(sourcemaps.init())
					   .pipe(newTS({
						   declarationFiles: true,
						   module: 'commonjs'
					   }));
	
	// tsResult.map.pipe(gulp.dest('test/output/test-2/map'));
	tsResult.dts.pipe(gulp.dest('test/output/test-2/dts'));
	return tsResult.js
			.pipe(sourcemaps.write({ includeContent: false, sourceRoot: '../../../test-2/' }))
			.pipe(gulp.dest('test/output/test-2/js'));
});
gulp.task('test-3', ['scripts', 'clean-test'], function() { // Test external resolve.
	var newTS = require('./release-2/main');
	var tsResult = gulp.src('test/test-3/*.ts')
					   .pipe(newTS({
						   declarationFiles: true,
						   module: 'amd',
						   noExternalResolve: true
					   }));
	
	// tsResult.map.pipe(gulp.dest('test/output/test-3/map'));
	tsResult.dts.pipe(gulp.dest('test/output/test-3/dts'));
	return tsResult.js
			.pipe(sourcemaps.write({ includeContent: false, sourceRoot: '../../../test-3/' }))
			.pipe(gulp.dest('test/output/test-3/js'));
});
gulp.task('test-4', ['scripts', 'clean-test'], function() { // Test catch errors.
	var newTS = require('./release-2/main');
	var tsResult = gulp.src('test/test-4/*.ts')
					   .pipe(newTS())
					   .on('error', function(err)
					   	{
					   		console.log('caught error:', err.message);
					   	});
	
	tsResult.dts.pipe(gulp.dest('test/output/test-4/dts'));
	return tsResult.js
			.pipe(sourcemaps.write({ includeContent: false, sourceRoot: '../../../test-4/' }))
			.pipe(gulp.dest('test/output/test-4/js'));
});
gulp.task('test', ['test-1', 'test-2', 'test-3', 'test-4']);


gulp.task('release', function() {
	return gulp.src(paths.releaseBeta + '/**').pipe(gulp.dest(paths.release));
});

gulp.task('watch', ['scripts'], function() {
	gulp.watch(paths.scripts, ['scripts']);
});

gulp.task('default', ['scripts']);
