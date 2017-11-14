window.onload = function () {
    window.metro = new MetroGroups('#main-wrapper', {
        groups:groups,
        options: {gridWidth: 50}
    });
    console.log(metro);
}
