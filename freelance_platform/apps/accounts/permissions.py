"""
用户权限类

这个模块包含了平台的各种权限检查类。
"""

from rest_framework import permissions


class IsClient(permissions.BasePermission):
    """
    只允许客户端访问的权限类
    """

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.user_type == 'client'
        )


class IsFreelancer(permissions.BasePermission):
    """
    只允许自由职业者访问的权限类
    """

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.user_type == 'freelancer'
        )


class IsAdmin(permissions.BasePermission):
    """
    只允许管理员访问的权限类
    """

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.user_type == 'admin'
        )


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    只允许对象的所有者编辑的权限类
    """

    def has_object_permission(self, request, view, obj):
        # 读取权限对任何认证用户开放
        if request.method in permissions.SAFE_METHODS:
            return True

        # 写入权限只对对象所有者开放
        return obj == request.user


class IsActiveUser(permissions.BasePermission):
    """
    只允许活跃用户访问的权限类
    """

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.user_status == 'active'
        )