[
    {
        name: 'earth',
        data: 'earth'
    },
    {
        name: 'buildings',
        data: 'buildings'
    },
    {
        name: 'water',
        data: 'water'
    },
    {
        name: 'landuse',
        data: 'landuse'
        // data: function (json) {
        //     if (!json['landuse'] || !json['landuse'].features) {
        //         return null;
        //     }

        //     return {
        //         type: 'FeatureCollection',
        //         features: json['landuse'].features.sort(function(a, b) {
        //             return (b.properties.area - a.properties.area);
        //         })
        //     };
        // }
    },
    {
        name: 'roads',
        data: 'roads'
    },
]
