var socket = io.connect();
// var talks = [];

// socket.on('init', function(data){
// 	talks = data.talks;
// 	console.log(data, angular.$apply);
// });

angular.module('CHAT', ['ngCookies']).

	run(['$rootScope', function($rootScope){

		// talksをrootScopeで定義している
		$rootScope.talks = [];

		socket.on('init', function(data){
			$rootScope.$apply(function(){
				$rootScope.talks = data.talks;
			})
		});
	}]).

	controller('talkCtrl', ['$scope', '$cookies', function($scope, $cookies){
		/* 注意 talksは$rootScope.talksにあります */
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

			// 下書きがある場合は削除する
			for(var i = 0; i < $scope.drafts.length; i++){
				if($scope.drafts[i].talker == talk.talker){
					$scope.$apply(function(){
						$scope.drafts.splice(i, 1);
					});
				}
			}
		});

		// 下書きがあるとき
		socket.on('draft', function(talk){
			// 自分の下書きは表示しない
			if(talk.talker == $scope.talker) return;
			
			// すでに下書きしているtalkerなら、変更や削除
			for(var i = 0; i < $scope.drafts.length; i++){
				if($scope.drafts[i].talker == talk.talker){
					if(talk.content == ""){
						$scope.$apply(function(){
							// 削除
							$scope.drafts.splice(i, 1);
						});
					} else {
						$scope.$apply(function(){
							// 変更
							$scope.drafts[i] = talk;
						});
					}
					return;
				}
			}
			// まだ、存在してないtalkerなら追加
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

		// 書いている時に何度も呼ばれる関数
		$scope.writing = function(){
			if(isWriting()){
				// 一度書くと名前は変更できないようにする
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

		// 書き途中
		function isWriting(){
			var f = before != $scope.talk;
			before = $scope.talk;
			return f;
		}


	}]);