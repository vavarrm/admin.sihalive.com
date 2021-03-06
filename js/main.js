

var FoodForIdApi ="/Api/foodForIdApi/";
var FoodListApi ="/Api/foodListApi/";
var OrderListApi ="/Api/orderList/";
var OrderDetailListApi ="/Api/orderDetailList/";
var UpdateOrderStatusApi ="/Api/updateOrderStatus/";
var OrdersCountApi ="/Api/ordersCount/";

var templatePath = "template/";

var adminApp = angular.module("adminApp", ['ngRoute']);


var foodEditCtrl = function($scope, $http, $routeParams){
	$scope.status_list = [
        {value :'sale_out' , name:'sale_out'},
        {value :'sale_on' , name:'sale_on'},
        {value :'sale_off' , name:'sale_off'}
    ];
	$scope.data = {
		food_url :food_url,
		action : '/Product/doEdit'
	};
	$scope.init = function()
	{
		$http({
			method: 'POST',
			url: FoodForIdApi,
			headers: {'Content-Type': 'application/json'},
			data: {f_id:$routeParams.f_id}
		}).then(
			function successCallback(response) {
				if(response['data']['status'] =='100')
				{
					$scope.food = response['data']['body']['row'];
					
					$scope.food['f_large_price'] =  parseFloat($scope.food['f_large_price']);
					$scope.food['f_medium_price'] =  parseFloat($scope.food['f_medium_price']);
					$scope.food['f_small_price'] =  parseFloat($scope.food['f_small_price']);
					$scope.food['f_image'] =$scope.food.ca_id+'-'+$scope.food.f_id+'-310x260.png';
					$scope.category_list = response['data']['body']['category_list'];
				}else
				{
					alert(response['data']['message']);
				}
			}, 
			function errorCallback(response) {
				// 请求失败执行代码
			}
		); 
	}
	
	
}

var foodListCtrl = function($scope, $http){
	$scope.data ={
		'records':'10',
		'p':'1',
		'search_click'	:false,
		'f_status'	:'sale_on',
		'o_id'	:'',
		'selectAll'	:false,
		'action_area' :false
	};

	$scope.del = function(f_id, $event){
		if(!confirm('confirm deletion'))
		{
			$event.preventDefault();
		}
	}
	
	$scope.search = function()
	{
		$scope.data.search_click = true;
		$scope.data.action_area = false;
		$scope.data.selectAll =false;
		$scope.data.p =1;
		$scope.foodList();
	}
	
	$scope.init = function()
	{
		$scope.foodList();
	}
	
	$scope.foodList = function()
	{
		
		var params = { 
			records	:	$scope.data.records, 
			ca_id :	$scope.data.ca_id,
			p	:	$scope.data.p,
			f_status :$scope.data.f_status
		};
		var getData = $.param( params );
		
		$http({
			method: 'GET',
			url: FoodListApi+'?'+getData,
			headers: {'Content-Type': 'application/json'},
			data: {search :'all'},
			async: false	
		}).then(
			function successCallback(response) {
				if(response['data']['status'] =='100')
				{
					$scope.foods = response['data']['body']['list'];
					$scope.pageInfo  = response['data']['body']['pageInfo'];
					$scope.data.category_list = response['data']['body']['category_list'];
					$scope.data.total = response['data']['body']['total'];

				}
			}, 
			function errorCallback(response) {
				// 请求失败执行代码
			}
		); 
	}
	
	$scope.setPage = function(p)
	{
		$scope.data.p =  p;
		$scope.foodList();
	}
	
	$scope.page_prev = function(p){
		if(p==0)
		{
			return false;
		}
		$scope.data.p =  p;
		$scope.foodList();
	}
	
	$scope.page_next = function(p){
		if($scope.data.p == $scope.pageInfo.pages.length)
		{
			return false;
		}
		$scope.data.p =  p;
		$scope.foodList();
	}
};

var ordersCtrl = function($scope, $http, $rootScope, $routeParams)
{
	$scope.data ={
		'records':'10',
		'p':'1',
		'search_click'	:false,
		'o_id'	:'',
		'selectAll'	:false,
		'action_area' :false
	};
	
	$scope.clickCheckbox = function()
	{
		if($('.clickCheckbox:checked ').length>0)
		{
			$scope.data.action_area = true;
		}else{
			$scope.data.action_area = false;
		}
	}
	
	$scope.batchUpdStatus = function()
	{
		if(confirm("update status ok"))
		{
			var o_id = new Array()
			angular.forEach($('.clickCheckbox:checked '), function(value, key) {
				o_id.push($(value).val());
			});
			$http({
			method: 'POST',
			url: UpdateOrderStatusApi,
			data: {
				o_id:o_id,
				o_status :$scope.action_select_status
			},
			headers: {'Content-Type': 'application/json'},
			}).then(
				function successCallback(response) {
					if(response['data']['status'] =='100')
					{
						orders_count = response['data']['body']['orders_count'];
						$rootScope.$broadcast('uploadSidebarOrders', orders_count);
						$scope.search();
						
					}else
					{
						alert(response['data']['message']);
					}
				}, 
				function errorCallback(response) {
					// 请求失败执行代码
					alert('system error');
				}
			);
		}
	}
	
	$scope.selectAll = function()
	{
		$scope.data.action_area = $scope.data.selectAll;
		angular.forEach($scope.data.orderCheckbox, function(value, key) {
			$scope.data.orderCheckbox[key] = $scope.data.selectAll;
		});
	}
	
	if( typeof $routeParams.status !="undefined")
	{
		$scope.data.search_status =$routeParams.status;
		
	}else
	{
		$scope.data.search_status ='all';
	}
	
	$rootScope.$on('uploadOrders', function(event, data){
		if(typeof data['orders_count'][1] =='undefined')
		{
			$scope.newOrdersCount=0;
		}else
		{
			
			$scope.newOrdersCount = data['orders_count'][1]['total'];
		}
		$scope.newOrdersCount = 1;
		return false;
    })
	
	$rootScope.$on('orderCountClick', function(event, status){
		$scope.search();
    })
	
	$scope.search = function()
	{
		$scope.data.search_click = true;
		$scope.data.action_area = false;
		$scope.data.selectAll =false;
		$scope.data.p =1;
		$scope.ordersList();
		
	}
	
	$scope.setPage = function(p)
	{
		if(p == $scope.data.p)
		{
			return false;
		}
		$scope.data.p =  p;
		$scope.ordersList();
	}
	
	$scope.page_prev = function(p){
		if(p==0)
		{
			return false;
		}
		$scope.data.p =  p;
		$scope.ordersList();
	}
	
	$scope.page_next = function(p){
		if($scope.data.p == $scope.pageInfo.pages.length)
		{
			return false;
		}
		$scope.data.p =  p;
		$scope.ordersList();
	}
	
	$scope.reset = function()
	{
		$scope.data.search_status='all';
		$scope.data.records='10';
		$scope.data.p='1';
		$scope.data.o_id ='';
		$scope.ordersList();
		$scope.data.search_click = false;
	}
	
	$scope.showDetailList = function(obj, index)
	{
		obj.detailShow = true;
		$scope.detail_show= true;
	}	
	
	$scope.hideDetailList = function(obj, index)
	{
		obj.detailShow = false;
		$scope.detail_show= false;
	}
	
	$scope.updateStatus = function(o_id, o_status, original_status)
	{
		if(o_status < original_status)
		{
			if(!confirm("back status ok?"))
			{
				return false;
			}
		}
		
		
		if(o_status -original_status > 1 )
		{
			if(!confirm("more status ok?"))
			{
				return false;
			}
		}
		
		var order = this.order;
		
		if(confirm("update status ok"))
		{
			$http({
			method: 'POST',
			url: UpdateOrderStatusApi,
			data: {
				o_id:o_id,
				o_status :o_status
			},
			headers: {'Content-Type': 'application/json'},
			}).then(
				function successCallback(response) {
					if(response['data']['status'] =='100')
					{
						order.change_status = false;
						order.original_status = o_status;
						orders_count = response['data']['body']['orders_count'];
						$rootScope.$broadcast('uploadSidebarOrders', orders_count);
						$scope.search();
						
					}else
					{
						alert(response['data']['message']);
					}
				}, 
				function errorCallback(response) {
					// 请求失败执行代码
					alert('system error');
				}
			);
		}
	}
	
	$scope.changeStatus = function(obj)
	{
		if(obj.original_status != obj.o_status)
		{
			obj.change_status=true;
			return false;
		}

		obj.change_status=false;
	}

	
		
	
	$scope.ordersList= function()
	{
		$scope.search_status ='all';
		$scope.isloading = true;
		$('.bar').width('20%');
		$('.bar').width('40%');
		$('.bar').width('60%');
		$('.bar').width('80%');

		var params = { 
			records	:	$scope.data.records, 
			o_status :	$scope.data.search_status,
			p	:	$scope.data.p,
			o_id	:$scope.data.o_id
		};
		var getData = $.param( params );
		$http({
			method: 'GET',
			url: OrderListApi+'?'+getData,
			async : false,
			headers: {'Content-Type': 'application/json'},
		}).then(
			function successCallback(response) {
				if(response['data']['status'] =='100')
				{
					$scope.orders = response['data']['body']['orders'];
					$scope.order_status = response['data']['body']['order_status'];
					$scope.data.total = response['data']['body']['total'];
					$scope.pageInfo =response['data']['body']['pageInfo'];
					$('.bar').width('100%');
					$scope.isloading = false;
				}else
				{
					alert(response['data']['message']);
				}
			}, 
			function errorCallback(response) {
				// 请求失败执行代码
				alert('system error');
			}
		);
	}
	$scope.ordersList();
	
	$scope.total = function(ary)
	{
		var total = 0;
		angular.forEach(ary, function(value, key) {
		});
	}
}

var bodyCtrl = function($scope, $http, MyService , orderCount, $rootScope)
{
	
	$scope.bodyinit = function()
	{
		if(typeof orderCount[1] !="undefined")
		{
			$scope.newOrderCount = orderCount[1]['total'];
		}else
		{
			$scope.newOrderCount = 0;
		}
		
		$scope.orders_count = orderCount;
	};
	
	$scope.selectStatus = function(status, total)
	{
		$rootScope.$broadcast('orderCountClick', status);
	}
	

	$rootScope.$on('uploadSidebarOrders', function(event, data){
		$scope.orders_count =data;
		if(typeof data[1] !="undefined")
		{
			$scope.newOrderCount = data[1]['total'];
		}else
		{
			$scope.newOrderCount = 0;
		}
	})

}

adminApp.factory('orderCount', function(){
	var orderCount ;
	$.ajax({
		async: false,
		type: 'get',
		dataType: 'json',
		url:  OrdersCountApi,
		success: function (data) {
			if(data.status =="100")
			{
				orderCount = data['body']['orders_count'];
			}
		},
		error: function (data) {
			var obj = {
				message :js_user_login_error
			}
			dialog(obj)
		}
	});
	return orderCount;
})

adminApp.factory('MyService', ['$q', '$rootScope', '$http', function($q, $rootScope, $http) 
{
	var Service = {};
	var url ="";
	var uid ="001";
	var host =location.protocol + '//' + location.host ;
	console.log(host);
	// var socket = io('host:2120');
	// var socket = io('http://websokcet.sihalive.com:2120');
	// var socket = io('http://admin.sihalive.dev.com:2120');
	// console.log
	var socket = io(host+':2120');
	// var ws = new WebSocket("ws://"+ws_domain+":2120");
	socket.on('connect', function(){
    	socket.emit('login', uid);
    });
	
	
	socket.on('order_alert', function(msg){
		$http({
			method: 'GET',
			url: OrdersCountApi,
			headers: {'Content-Type': 'application/json'},
		}).then(
			function successCallback(response) {
				if(response['data']['status'] =='100')
				{
					var orders_count = response['data']['body']['orders_count'];
					// $rootScope.$broadcast('uploadOrders', {orders_count:orders_count});
					$rootScope.$broadcast('uploadSidebarOrders', orders_count);
					dialog({
						message:'hello you have new order',
						buttons: [
							{
							  text: "close",
							  click: function() {
								$( this ).dialog( "close" );
							  }
							},
							{
							  text: "confirm",
							  click: function() {
								$('select[name=o_status]').val(1);
								$('#search-btn').click();
								$( this ).dialog( "close" );
								$.stopSound();
							  }
							}
						]
					});
					$.playSound("/assets/sound/order_come.mp3");
				}else
				{
					alert(response['data']['message']);
				}
			}, 
			function errorCallback(response) {
				// 请求失败执行代码
				alert('system error');
			}
		);
    });
	return Service;
}]);
adminApp.controller('foodListCtrl',  ['$scope', '$http', foodListCtrl]);
adminApp.controller('foodEditCtrl',  ['$scope', '$http', '$routeParams',foodEditCtrl]);
adminApp.controller('ordersCtrl',  ['$scope', '$http', '$rootScope' ,'$routeParams', ordersCtrl]);
adminApp.controller('bodyCtrl',  ['$scope', '$http', 'MyService' ,'orderCount' ,'$rootScope' ,bodyCtrl]);


adminApp.config(function($routeProvider){
  $routeProvider.when("/",
    {
		templateUrl: templatePath+"orders/list.html"+"?"+ Math.random(),
		controller: "ordersCtrl",
		cache: false,
    }
  ).when("/food",{
		templateUrl: templatePath+"food/list.html"+"?"+ Math.random(),
		controller: "foodListCtrl", 
		cache: false,
  }).when("/food/edit",{
		templateUrl: templatePath+"food/foodform.html"+"?"+ Math.random(),
		controller: "foodEditCtrl", 
		cache: false,
  })
});

function dialog(object2)
{
	if(typeof object2 !="object")
	{
		object2 ={};
	}
	var  object1 ={
		buttons: [
			{
			  text: "close",
			  click: function() {
				$( this ).dialog( "close" );
			  }
			}
		]
	};
	$.extend( object1, object2 );
	$( "#dialog p").text(object1.message); 
	$( "#dialog" ).dialog(object1);
}



