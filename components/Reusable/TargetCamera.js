/**
 * TargetCamera 0.1.0
 * (c) 2013 Luke Moody (http://www.github.com/squarefeet)
 * https://github.com/squarefeet/THREE.TargetCamera
 *
 * TargetCamera may be freely distributed under the MIT license
 *  (See the LICENSE file at root of this repository.)
 */
import { Euler, PerspectiveCamera, Object3D, Vector3 } from 'three'

export let TargetCamera = function( fov, aspect, near, far ) {
  PerspectiveCamera.call( this );

  // The usual PerspectiveCamera settings.
  this.fov = fov !== undefined ? fov : 50;
  this.aspect = aspect !== undefined ? aspect : 1;
  this.near = near !== undefined ? near : 0.1;
  this.far = far !== undefined ? far : 2000;

  this.targets = {};
  this.targetOrder = [];
  this.currentTargetName = null;

  // A helper Object3D. Used to help position the camera based on the
  // two position settings above.
  this._idealObject = new Object3D();

  this._isTransitioning = false;

  // Default target settings.
  this._defaults = {
      name: null,
      targetObject: new Object3D(),
      cameraPosition: new Vector3(0, 30, 50),
      cameraRotation: undefined,
      fixed: false,
      stiffness: 0.4,
      matchRotation: true
  };

  this.updateProjectionMatrix();
};

TargetCamera.prototype = Object.create( PerspectiveCamera.prototype );

TargetCamera.prototype._translateIdealObject = function( vec ) {
  var obj = this._idealObject;

  if( vec.x !== 0 ) {
      obj.translateX( vec.x );
  }

  if( vec.y !== 0 ) {
      obj.translateY( vec.y );
  }

  if( vec.z !== 0 ) {
      obj.translateZ( vec.z );
  }
};

TargetCamera.prototype._createNewTarget = function() {
  var defaults = this._defaults;

  return {
      name: defaults.name,
      targetObject: defaults.targetObject,
      cameraPosition: defaults.cameraPosition,
      cameraRotation: defaults.cameraRotation,
      fixed: defaults.fixed,
      stiffness: defaults.stiffness,
      matchRotation: defaults.matchRotation
  };
};

TargetCamera.prototype._determineCameraRotation = function( rotation ) {
  if( rotation instanceof Euler ) {
      return new Quaternion().setFromEuler( rotation );
  }
  else if( rotation instanceof Quaternion ) {
      return rotation;
  }
  else {
      return undefined;
  }
};

TargetCamera.prototype.addTarget = function( settings ) {
  var target = this._createNewTarget();

  if( typeof settings === 'object' ) {
      for( var i in settings ) {
          if( target.hasOwnProperty( i ) ) {
              if( i === 'cameraRotation' ) {
                  target[ i ] = this._determineCameraRotation( settings[ i ] );
              }
              else {
                  target[ i ] = settings[ i ];
              }
          }
      }
  }

  this.targets[ settings.name ] = target;
  this.targetOrder.push( settings.name );
};

TargetCamera.prototype.setTarget = function( name ) {
  if( this.targets.hasOwnProperty( name ) ) {
      this.currentTargetName = name;
  }
  else {
      console.warn( 'TargetCamera.setTarget: No target with name ' + name );
  }
};

TargetCamera.prototype.removeTarget = function( name, replacementName ) {
  var targets = this.targets,
      targetOrder = this.targetOrder;

  // If there's only one target, then make sure it's not removed
  // otherwise the world might end. And that is never fun.
  if( targetOrder.length === 1 ) {
      console.warn( 'TargetCamera: Will not remove only existing camera target.' );
      return;
  }

  // If there's a target with the given name, make sure it's
  // removed from both the targetOrder array and the
  // main targets object.
  if( targets.hasOwnProperty( name ) ) {
      targetOrder.splice( targetOrder.indexOf( name ), 1 );
      targets[ name ] = null;
  }

  // If a replacement target is given, and it exists in the target
  // store, then jump to that target
  if( replacementName && targets.hasOwnProperty( replacementName ) ) {
      this.setTarget( replacementName );
  }

  // Otherwise, jump to the last target in the targetOrder array.
  else {
      this.setTarget( targetOrder[ targetOrder.length - 1 ] );
  }
};

TargetCamera.prototype.update = function( dt ) {
  var target = this.targets[ this.currentTargetName ],
      ideal = this._idealObject;

  if( !target ) return;

  if( !target.fixed ) {
      ideal.position.copy( target.targetObject.position );
      ideal.quaternion.copy( target.targetObject.quaternion );

      if( target.cameraRotation !== undefined ) {
          ideal.quaternion.multiply( target.cameraRotation );
      }

      this._translateIdealObject( target.cameraPosition );
      this.position.lerp( ideal.position, target.stiffness );

      if( target.matchRotation ) {
          this.quaternion.slerp( ideal.quaternion, target.stiffness );
      }
      else {
          this.lookAt( target.targetObject.position );
      }
  }
  else {
      this.position.copy( target.cameraPosition );
      this.lookAt( target.targetObject.position );
  }
};