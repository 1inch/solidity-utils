module.exports = {
    skipFiles: [
        'mocks', 'tests'
    ],
    mocha: {
        grep: "@skip-on-coverage",
        invert: true
    },
}
