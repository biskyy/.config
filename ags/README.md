# my ags/astal bar inspired by Abaan404's one.

some general info(might get changed later):
the components that form the bar are called modules(bar modules)
the windows that spawn when clicking certain modules are called panels. i might change the naming to popups later. 
the bar itself and the overlay created by the WindowManager are also panels although they dont adhere to the definition above.(probably have to change this)

the animation for when a panel is created or destroyed is defined by default in style.scss and more specific to each panel in their own scss file. the animation can be defined as such:
.{panel-name}.{create/destroy}>.layout-box {
    property-that-should-be-changed: something;
}
