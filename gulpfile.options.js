module.exports = {
    sass: {
        src: [
            "./assets/css/src/wp-admin.scss",
            "./assets/css/src/wp-login.scss",
            "./assets/css/src/styles.scss"
        ],
        watch: ["./assets/css/src/**/*.scss"],
        distFolder: "./assets/css/dist",
        minify: true,
        sourcemap: true
    },
    javascript: {
        src: [
            "./assets/js/src/themes.js",
            {
                name: "themes-jquery",
                src: ["./assets/js/src/themes-jquery/main.js"]
            }
            // {
            //     name: "common-include",
            //     src: [
            //         // "node_modules/jquery/dist/jquery.js",
            //         "./assets/js/src/common-include/dashboard.js",
            //         "./assets/js/src/common-include/user.js"
            //     ]
            // }
        ],
        watch: ["./assets/js/src/**/*.js"],
        distFolder: "./assets/js/dist",
        minify: false,
        sourcemap: false
    },
    browserSync: {
        watchFiles: [
            "./assets/css/dist/*.min.css",
            "./assets/js/dist/*.min.js",
            "./**/*.php"
        ],

        // Available config options
        // https://www.browsersync.io/docs/options
        config: {
            proxy: "http://projectname.local/",
            host: "projectname.local",
            watchTask: true,
            open: "external"
        }
    }
};
