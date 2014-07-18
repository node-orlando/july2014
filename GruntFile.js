module.exports = function (grunt) {
    grunt.loadNpmTasks('simple-oop');
    
    grunt.config.init({
        'simple-oop': {
            src:  'public/js',
            dest: 'public/dist/game.js',
            
            hint: true,
            
            watch: true
        }
    });
};