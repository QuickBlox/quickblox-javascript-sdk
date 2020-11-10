const JasmineConsoleReporter = require('jasmine-console-reporter');

jasmine.getEnv().addReporter(new JasmineConsoleReporter({
    colors:         2,         // (0|false)|(1|true)|2
    cleanStack:     0,         // (0|false)|(1|true)|2|3
    verbosity:      4,         // (0|false)|1|2|(3|true)|4|Object
    listStyle:      'indent',  // "flat"|"indent"
    timeUnit:       'ms',      // "ms"|"ns"|"s"
    timeThreshold:  { ok: 500, warn: 1000, ouch: 3000 }, // Object|Number
    activity:       false,     // boolean or string ("dots"|"star"|"flip"|"bouncingBar"|...)
    emoji:          true,
    beep:           false
}));
