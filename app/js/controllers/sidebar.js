'use strict';

function SidebarCtrl( $scope, $location, $timeout, Project ) {

    // Handles all the logic for the sidebar on every single page
    // that displays the projects available to the user

    $scope.$on('projectAdded', function(e,newproject){
        $scope.projects.push(newproject);
        console.log()
        $timeout(function(){
            $scope.chooseProject(newproject);
        },500);
    });

    $scope.$on('projectNameChange', function(e,project){
        
        console.log(project);
        $scope.getProjectById(project.id).name = project.name;
        
    });

    $scope.$on('projectDeleted', function(e,args){
        // remove the project with args.id from the $scope.projects list
        var l = $scope.projects.length;
        // could optimize this search by storing the index of item in the
        // array somewhere that the projects detail controller could access
        // it as well. Then just return the index on the projectDeleted event.
        var prev = 0;

        // this solution doesn't account for situations when angular is using
        // and displaying a different list of elements, sorted, filtered, or paginated.
        for(var i = 0; i < l ; i++){
            if($scope.projects[i].key === args.id){

                // want to animate the deletion of this element before removing it
                var el = $('.project-item').eq(i);
                el.addClass('ui-animate');
                $timeout(function(){
                    $scope.projects.splice(i,1);
                    if(i !== 0){
                        // choose the project right before this one
                        // unless its the first project, then use the default
                        // 0 index for the first item
                        prev = i - 1;
                    }
                    $scope.chooseProject($scope.projects[prev]);
                }, 600);
                
                break;
            }
        }
        
    });

    $scope.loadProjects = function(){
        $scope.loading = {
            finished: true
        }

        $scope.projects = [];

        Project.getAll(function(data){
            console.log(data);
            $scope.projects = data;
        });

        $scope.activeProject = undefined;
    };

    // Non cached old version  
    // $scope.getProjectById = function(id){
    //     // use a binary search if list is sorted by id/key
    //     // otherwise use a normal search

    //     // cache the results as well
    //     var l = $scope.projects.length;
    //     for(var i = 0; i < l ; i++){
    //         if($scope.projects[i].key === id){
    //             return $scope.projects[i];
    //         }
    //     }
    // };

    $scope.getProjectById = (function(){

        var cache = {};

        return function(id){
            var l = $scope.projects.length;
            var cached = cache[id];

            if(cached){
                // cache hit
                return cached;
            }

            // cache miss
            for(var i = 0; i < l ; i++){
                if($scope.projects[i].key === id){
                    cache[id] = $scope.projects[i];
                    return $scope.projects[i];
                }
            }
        };

    })();

    $scope.chooseProject = function(project){
        $scope.query = '';
        $scope.activeProject = project;
        $location.path('/project/' + project.key);
    };

    $scope.isActive = function(project){
        if($scope.activeProject == project){
            return true;
        }
        else{
            return false;
        }
    };

    $scope.createNewProject = function(){
        $scope.activeProject = undefined;
        $location.path('/create');
        // var name = prompt("What would you like to name this project?");
        // if(name){
        //     $scope.projects.push({"name":name,"dl":"none"});
        //     $timeout(function(){
        //         $location.path('project/' + name);
        //     }, 500);
        // }
    };

    $scope.loadProjects();

}

SidebarCtrl.$inject = ['$scope', '$location', '$timeout', 'Project'];