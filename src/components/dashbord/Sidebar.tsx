import { AuthGuard } from '@/app/(auth)/AuthGuard'
import Link from 'next/link'
import React from 'react'

function Sidebar() {
  return (
   <div className='h-screen w-[300px] bg-pink-950'>
      {/* Admin user කෙනෙකුට විතරක් user management link එක පෙන්වනවා */}
      <AuthGuard requiredRoles={["ADMIN"]}>
        <Link href="/admin/users">User Management</Link>
      </AuthGuard>
      
      {/* Manager කෙනෙකුට report බලන්න link එක පෙන්වනවා */}
      <AuthGuard requiredPermissions={["read:reports"]}>
        <Link href="/dashboard/reports">View Reports</Link>
      </AuthGuard>
      
      {/* සාමාන්‍ය user කෙනෙකුටත් පුළුවන් settings page එකට යන්න */}
     <Link href="/dashboard/settings">
  Settings
</Link>
    </div>
  )
}

export default Sidebar
