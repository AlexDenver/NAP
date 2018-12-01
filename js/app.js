angular.module('nap', ['ui.router'])

.controller('main', ($scope, $http, $stateParams)=>{
    $scope.text = "Ready";
    // $scope.res = 0;
    console.log($stateParams)
    if($stateParams.page){
        $http.get('http://127.0.0.1:1090/page/'+$stateParams.page)
        .then((res)=>{
            console.log(res)
            $scope.elements = res.data;
            console.log(res.data)
        })
        .then(()=>{
            setTimeout(()=>{
                elementsInit();
    
            }, 500)
        })
    }
    $scope.getStyle = function(ele) {
        let style;
        let dim = ele.dim;
        // console.log(dim);
        style = `top: ${dim.top}px ;left: ${dim.left}px;`
        if(ele.type!="folder")            
            style += `width: ${dim.width}px ;height: ${dim.height}px;z-index:${dim.z};`
            
            return style;
    }
})  


.config(($stateProvider)=>{
    $stateProvider.state('page', {
        url: '/page/:page',      
        templateUrl: './templates/main.html',
      })
    $stateProvider.state('signup', {
        url: '/signup',      
        templateUrl: './templates/signup.html',
    })
    $stateProvider.state('homepage', {
        url: '/',      
        templateUrl: './templates/index.html',
    })
    $stateProvider.state('login', {
        url: '/login',      
        templateUrl: './templates/login.html',
    })
})