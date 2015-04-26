module.exports = function(grunt) {
  require('jit-grunt')(grunt)

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    supervisor: {
      "hapi-dev": {
        script: ".",
        options: {
          watch: ["."],
          ignore: [
            "Gruntfile.js",
            "package.json",
            "run",
            "node_modules",
            "server/swagger/ui",
          ],
          extensions: ["js", "json"],
          noRestartOn: "exit",
          quiet: true,
          forceSync: false
        }
      }
    }
  })

  grunt.registerTask('default', [
    "supervisor:hapi-dev",
  ])
}
