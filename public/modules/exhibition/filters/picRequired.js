/**
 * Created by User on 2/11/2015.
 */
angular.module('common').filter('picRequired', function () {
    // function to invoke by Angular each time
    // Angular passes in the `items` which is our Array
    return function (items) {
        // Create a new Array
        var filtered = [];
        // loop through existing Array
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.pic.size) {
                filtered.push(item);
            }
        }
        // boom, return the Array after iteration's complete
        return filtered;
    };
});
