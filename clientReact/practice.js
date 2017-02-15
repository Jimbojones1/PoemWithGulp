var data = [{to: 'jim',
            from: 'bill',
            prvMessage: 'hi'
            },
            {
            to: 'taco',
            from: 'bill',
            prvMessage: 'yo'
            },
            {
            to: 'jim',
            from: 'bill',
            prvMessage: 'burrito'
            }]


//         console.log(data)
//         console.log(self.props.user)
//         console.log('filterd data data %%%%%%%%%%%%%%%%%%%%%%*******%*')
//         return data.props.user === self.props.user

var jim = 'taco'
var filteredData = data.filter(function(data, i){
  return data.to === jim
})

console.log('------------------------------------------------')
console.log(filteredData)
 dsfsd
dfd
