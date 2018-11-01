var socket = io.connect();
// var talks = [];

// socket.on('init', function(data){
// 	talks = data.talks;
// 	console.log(data, angular.$apply);
// });

angular.module('CHAT', ['ngCookies']).

	run(['$rootScope', function($rootScope){

		// Define talks on $rootScope
		$rootScope.talks = [];

		socket.on('init', function(data){
			$rootScope.$apply(function(){
				$rootScope.talks = data.talks;
			})
		});
	}]).

	controller('talkCtrl', ['$scope', '$cookies', function($scope, $cookies){
		/* NOTE: talks is defined in $rootScope */
		$scope.talker = $cookies.talker || "";
		$scope.talk = "";
		$scope.drafts = [];
		$scope.changeNamable = true;
		var before = "";

		socket.on('new_talk', function(talk){
			console.log(talk);
			$scope.$apply(function(){
				$scope.talks.push(talk);
			});

			// Remove drafts if they exist
			for(var i = 0; i < $scope.drafts.length; i++){
				if($scope.drafts[i].talker == talk.talker){
					$scope.$apply(function(){
						$scope.drafts.splice(i, 1);
					});
				}
			}
		});

		// If drafts exist
		socket.on('draft', function(talk){
			// Don't show my own draft
			if(talk.talker == $scope.talker) return;
			
			// If a talker is a talker who has drafted, modify or delete
			for(var i = 0; i < $scope.drafts.length; i++){
				if($scope.drafts[i].talker == talk.talker){
					if(talk.content == ""){
						$scope.$apply(function(){
							// Delete
							$scope.drafts.splice(i, 1);
						});
					} else {
						$scope.$apply(function(){
							// Modify
							$scope.drafts[i] = talk;
						});
					}
					return;
				}
			}
			// Add a talk if a talker has not existed yet
			if(talk.content != ""){
				$scope.$apply(function(){
					$scope.drafts.push(talk);
				});
			}
		});

		$scope.add = function(){
			if($scope.talk == "") return;

			socket.emit('submit', {
				content: $scope.talk,
				talker : $scope.talker
			});
			$scope.talk = "";
		}

		// A function which is called when writing
		$scope.writing = function(){
			if(isWriting()){
				// Fix name when the user writes once
				if($scope.changeNamable){
					$scope.changeNamable = false;
					$cookies.talker = $scope.talker;
				}
				socket.emit('writing', {
					content: $scope.talk,
					talker : $scope.talker
				});
			}
		}

		// When writing
		function isWriting(){
			var f = before != $scope.talk;
			before = $scope.talk;
			return f;
		}


	}]);
