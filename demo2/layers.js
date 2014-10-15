[
    {
        name: 'earth',
        data: 'earth'
    },
    {
        name: 'water',
        data: 'water'
    },
    {
        name: 'buildings',
        data: 'buildings'
    },
    {
        name: 'landuse',
        data: function (json) {
            if (!json['landuse'] || !json['landuse'].features) {
                return null;
            }

            return {
                type: 'FeatureCollection',
                features: json['landuse'].features.sort(function(a, b) {
                    return (b.properties.area - a.properties.area); 
                })
            };
        }
    },
    {
        name: 'roads',
        data: function (json) {
            if (!json['roads'] || !json['roads'].features) {
                return null;
            }

            return {
                type: 'FeatureCollection',
                features: json['roads'].features.sort(function(a, b) {
                  return (a.properties.sort_key - b.properties.sort_key);
                })
            };
        }
    },
]
