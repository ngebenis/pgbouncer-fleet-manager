import { ref } from 'vue'
const locale = ref<'id'|'en'>((localStorage.getItem('pgbm_lang') as 'id'|'en') || 'id')
const M: Record<string, Record<string,string>> = {
  id: {
    // Navigation
    dashboard:'Dashboard', pools:'Pools', clients:'Clients', servers:'Servers',
    stats:'Stats', databases:'Databases', configuration:'Konfigurasi',
    manage_servers:'Kelola Server', users:'Pengguna', audit_log:'Audit Log',
    backup:'Backup & Restore', branding:'Identitas',
    // Auth
    login:'Masuk', logout:'Keluar', change_password:'Ganti Password',
    old_password:'Password Lama', new_password:'Password Baru',
    // Common
    username:'Username', password:'Password', role:'Role', label:'Label',
    save:'Simpan', cancel:'Batal', delete:'Hapus', edit:'Edit', add:'Tambah',
    test:'Test', active:'Aktif', loading:'Memuat...', no_data:'Tidak ada data',
    filter:'Filter...', updated:'Diperbarui', just_now:'baru saja', refresh:'Refresh',
    // Service
    service:'Service PgBouncer', start:'Start', stop:'Stop', restart:'Restart',
    reload_config:'Reload Config', pause:'Pause', resume:'Resume', kill:'Kill',
    // Metrics
    cl_active:'Client Aktif', cl_waiting:'Client Waiting',
    sv_active:'Server Aktif', sv_idle:'Server Idle',
    max_wait:'Max Wait', pool_count:'Pool Aktif',
    // Pool mode
    session_mode:'session', transaction_mode:'transaction', statement_mode:'statement',
    // Confirmations
    confirm_stop:'Yakin stop PgBouncer? Semua koneksi akan terputus.',
    confirm_restart:'Yakin restart PgBouncer?',
    confirm_delete:'Hapus "%s"? Aksi ini tidak bisa dibatalkan.',
    confirm_kill:'Kill semua koneksi ke "%s"?',
    confirm_pause:'Pause database "%s"?',
    // Users
    admin:'Admin', viewer:'Viewer',
    confirm_delete_user:'Hapus user "%s"? Aksi ini tidak bisa dibatalkan.',
    user_added:'User "%s" berhasil ditambahkan',
    role_updated:'Role berhasil diperbarui',
    password_changed:'Password berhasil diubah',
    // Server manage
    server_list:'Daftar Server PgBouncer', add_server:'Tambah Server Baru',
    edit_server:'Edit Server', server_added:'Server "%s" berhasil ditambahkan',
    server_updated:'Server "%s" berhasil diperbarui',
    server_deleted:'Server "%s" dihapus',
    connected:'Terhubung', cannot_delete_last:'Tidak bisa menghapus server terakhir',
    // Server form
    server_id:'ID Server', server_label:'Label', admin_host:'Admin Host',
    admin_port:'Admin Port', admin_user:'Admin User', admin_password:'Admin Password',
    password_keep:'(kosongkan = pertahankan)', service_name:'Nama Service',
    control_mode:'Mode Kontrol', control_ssh:'SSH (server terpisah)',
    control_local:'Local (systemctl langsung)',
    ssh_host:'SSH Host', ssh_port:'SSH Port', ssh_user:'SSH User',
    ssh_key_path:'SSH Key Path', use_sudo:'Gunakan sudo saat menjalankan systemctl',
    ini_path:'Path pgbouncer.ini (opsional, untuk mode local)',
    id_hint:'Huruf kecil, angka, - dan _. Tidak bisa diubah setelah disimpan.',
    key_hint:'Path di dalam container.',
    // Config
    runtime_set:'SET Parameter (Runtime)', changeable_only:'Hanya untuk parameter Changeable = yes',
    show_config:'SHOW CONFIG (Runtime)', pool_mode_per_db:'Ubah Pool Mode per Database',
    edit_ini_reload:'Edit pgbouncer.ini + auto RELOAD',
    global_setting:'Ubah Setting Global (pgbouncer.ini)',
    field_name:'Nama field', new_value:'Nilai baru',
    apply_reload:'Terapkan + Reload', select_database:'Pilih database',
    // Stats
    total_requests:'Total Requests', total_received:'Total Diterima',
    total_sent:'Total Dikirim', stats_per_db:'Stats per Database',
    // Backup
    backup_download:'Download Backup', backup_restore:'Restore dari File',
    backup_note:'Backup berisi servers.json dan users.json',
    backup_success:'Backup berhasil didownload',
    restore_confirm:'Restore akan menimpa data servers dan users. Lanjutkan?',
    restore_success:'Restore berhasil',
    // Alerts
    alerts_title:'Konfigurasi Alert', cl_waiting_threshold:'Threshold CL Waiting',
    maxwait_threshold:'Threshold Max Wait (ms)', alerts_enabled:'Alert aktif',
    alerts_saved:'Konfigurasi alert disimpan',
    // Theme/Lang
    theme_dark:'Tema Gelap', theme_light:'Tema Terang', profile:'Profil',
    // Warnings
    warn_waiting:'Ada %s client sedang menunggu koneksi. Pertimbangkan menaikkan pool_size.',
    warn_maxwait:'Max wait %s ms — ada pool yang bottleneck.',
    // Misc
    version:'Versi', host:'Host', port:'Port', database:'Database',
    user:'User', mode:'Mode', state:'State', type:'Tipe',
    actions:'Aksi', name:'Nama', current:'Saat ini', paused:'Dijeda',
    disabled:'Dinonaktifkan', pool_size:'Pool Size', max_conn:'Max Koneksi',
    connect_time:'Waktu Koneksi', request_time:'Waktu Request',
    close_needed:'Perlu Ditutup', changeable:'Bisa Diubah', description:'Deskripsi',
    pause_all:'Pause Semua', resume_all:'Resume Semua',
    key:'Key', value:'Nilai',
    // Branding
    branding_identity:'Identitas Aplikasi', branding_identity_hint:'Nama aplikasi dan organisasi ini tampil di halaman login, sidebar, dan footer.',
    app_name:'Nama Aplikasi', app_sub:'Sub-judul', company_name:'Nama Perusahaan / Organisasi',
    company_name_placeholder:'mis. PT. Nama Perusahaan Anda',
    logo:'Logo', logo_hint:'Format PNG, JPEG, WEBP, atau SVG. Maksimal 2MB. Tampil di sidebar, halaman login, dan tab browser.',
    logo_active:'Logo kustom aktif', logo_default:'Memakai icon default (◈)',
    upload:'Upload', reset_logo:'Reset ke Default', choose_file_first:'Pilih file logo dulu',
    confirm_reset_logo:'Hapus logo kustom dan kembali ke icon default?',
    branding_saved:'Identitas aplikasi disimpan', logo_uploaded:'Logo berhasil diupload', logo_reset:'Logo direset ke default',
  },
  en: {
    // Navigation
    dashboard:'Dashboard', pools:'Pools', clients:'Clients', servers:'Servers',
    stats:'Stats', databases:'Databases', configuration:'Configuration',
    manage_servers:'Manage Servers', users:'Users', audit_log:'Audit Log',
    backup:'Backup & Restore', branding:'Identity',
    // Auth
    login:'Login', logout:'Logout', change_password:'Change Password',
    old_password:'Old Password', new_password:'New Password',
    // Common
    username:'Username', password:'Password', role:'Role', label:'Label',
    save:'Save', cancel:'Cancel', delete:'Delete', edit:'Edit', add:'Add',
    test:'Test', active:'Active', loading:'Loading...', no_data:'No data',
    filter:'Filter...', updated:'Updated', just_now:'just now', refresh:'Refresh',
    // Service
    service:'PgBouncer Service', start:'Start', stop:'Stop', restart:'Restart',
    reload_config:'Reload Config', pause:'Pause', resume:'Resume', kill:'Kill',
    // Metrics
    cl_active:'Active Clients', cl_waiting:'Waiting Clients',
    sv_active:'Active Servers', sv_idle:'Idle Servers',
    max_wait:'Max Wait', pool_count:'Active Pools',
    // Pool mode
    session_mode:'session', transaction_mode:'transaction', statement_mode:'statement',
    // Confirmations
    confirm_stop:'Stop PgBouncer? All connections will be dropped.',
    confirm_restart:'Restart PgBouncer?',
    confirm_delete:'Delete "%s"? This cannot be undone.',
    confirm_kill:'Kill all connections to "%s"?',
    confirm_pause:'Pause database "%s"?',
    // Users
    admin:'Admin', viewer:'Viewer',
    confirm_delete_user:'Delete user "%s"? This cannot be undone.',
    user_added:'User "%s" added successfully',
    role_updated:'Role updated successfully',
    password_changed:'Password changed successfully',
    // Server manage
    server_list:'PgBouncer Server List', add_server:'Add New Server',
    edit_server:'Edit Server', server_added:'Server "%s" added successfully',
    server_updated:'Server "%s" updated successfully',
    server_deleted:'Server "%s" deleted',
    connected:'Connected', cannot_delete_last:'Cannot delete last server',
    // Server form
    server_id:'Server ID', server_label:'Label', admin_host:'Admin Host',
    admin_port:'Admin Port', admin_user:'Admin User', admin_password:'Admin Password',
    password_keep:'(leave blank to keep existing)', service_name:'Service Name',
    control_mode:'Control Mode', control_ssh:'SSH (remote server)',
    control_local:'Local (direct systemctl)',
    ssh_host:'SSH Host', ssh_port:'SSH Port', ssh_user:'SSH User',
    ssh_key_path:'SSH Key Path', use_sudo:'Use sudo when running systemctl',
    ini_path:'pgbouncer.ini Path (optional, for local mode)',
    id_hint:'Lowercase letters, numbers, - and _. Cannot be changed after saving.',
    key_hint:'Path inside the container.',
    // Config
    runtime_set:'SET Parameter (Runtime)', changeable_only:'Only for parameters with Changeable = yes',
    show_config:'SHOW CONFIG (Runtime)', pool_mode_per_db:'Change Pool Mode per Database',
    edit_ini_reload:'Edit pgbouncer.ini + auto RELOAD',
    global_setting:'Change Global Setting (pgbouncer.ini)',
    field_name:'Field name', new_value:'New value',
    apply_reload:'Apply + Reload', select_database:'Select database',
    // Stats
    total_requests:'Total Requests', total_received:'Total Received',
    total_sent:'Total Sent', stats_per_db:'Stats per Database',
    // Backup
    backup_download:'Download Backup', backup_restore:'Restore from File',
    backup_note:'Backup contains servers.json and users.json',
    backup_success:'Backup downloaded successfully',
    restore_confirm:'Restore will overwrite server and user data. Continue?',
    restore_success:'Restore successful',
    // Alerts
    alerts_title:'Alert Configuration', cl_waiting_threshold:'CL Waiting Threshold',
    maxwait_threshold:'Max Wait Threshold (ms)', alerts_enabled:'Alerts enabled',
    alerts_saved:'Alert configuration saved',
    // Theme/Lang
    theme_dark:'Dark Theme', theme_light:'Light Theme', profile:'Profile',
    // Warnings
    warn_waiting:'%s clients are waiting for connections. Consider increasing pool_size.',
    warn_maxwait:'Max wait %s ms — pool bottleneck detected.',
    // Misc
    version:'Version', host:'Host', port:'Port', database:'Database',
    user:'User', mode:'Mode', state:'State', type:'Type',
    actions:'Actions', name:'Name', current:'Current', paused:'Paused',
    disabled:'Disabled', pool_size:'Pool Size', max_conn:'Max Connections',
    connect_time:'Connect Time', request_time:'Request Time',
    close_needed:'Close Needed', changeable:'Changeable', description:'Description',
    pause_all:'Pause All', resume_all:'Resume All',
    key:'Key', value:'Value',
    // Branding
    branding_identity:'Application Identity', branding_identity_hint:'This app and organization name appears on the login page, sidebar, and footer.',
    app_name:'App Name', app_sub:'Subtitle', company_name:'Company / Organization Name',
    company_name_placeholder:'e.g. Your Company Name Ltd.',
    logo:'Logo', logo_hint:'PNG, JPEG, WEBP, or SVG format. Max 2MB. Shown in the sidebar, login page, and browser tab.',
    logo_active:'Custom logo active', logo_default:'Using default icon (◈)',
    upload:'Upload', reset_logo:'Reset to Default', choose_file_first:'Choose a logo file first',
    confirm_reset_logo:'Remove the custom logo and revert to the default icon?',
    branding_saved:'Application identity saved', logo_uploaded:'Logo uploaded successfully', logo_reset:'Logo reset to default',
  }
}
export function useI18n() {
  const t = (key: string, ...args: string[]) => {
    let str = M[locale.value]?.[key] ?? M['en']?.[key] ?? key
    args.forEach(a => { str = str.replace('%s', a) })
    return str
  }
  const toggleLocale = () => {
    locale.value = locale.value === 'id' ? 'en' : 'id'
    localStorage.setItem('pgbm_lang', locale.value)
  }
  return { locale, t, toggleLocale }
}
