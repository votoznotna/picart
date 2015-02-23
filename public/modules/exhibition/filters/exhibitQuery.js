/**
 * Created by User on 2/22/2015.
 */
angular.module('exhibition').filter('exhibitQuery', function () {
    // function to invoke by Angular each time
    // Angular passes in the `items` which is our Array
    return function (items, search) {
        // Create a new Array
        var filtered = [];
        if(search)
        {
            // loop through existing Array
            var sTitle = search.title.toLowerCase();
            var sContent = search.content.toLowerCase();
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item.title.toLowerCase().indexOf(sTitle) != -1 ||
                    item.content.toLowerCase().indexOf(sContent) != -1) {
                    filtered.push(item);
                }
            }
        }
        // boom, return the Array after iteration's complete
        return filtered;
    };
});
