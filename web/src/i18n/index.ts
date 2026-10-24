import { ref } from 'vue'
export type Locale = 'id'|'en'|'zh'|'hi'|'es'|'fr'|'pt'|'ar'|'bn'|'ru'
export const LOCALES: { code: Locale; flag: string; label: string }[] = [
  { code:'id', flag:'🇮🇩', label:'Bahasa Indonesia' },
  { code:'en', flag:'🇬🇧', label:'English' },
  { code:'zh', flag:'🇨🇳', label:'中文' },
  { code:'hi', flag:'🇮🇳', label:'हिन्दी' },
  { code:'es', flag:'🇪🇸', label:'Español' },
  { code:'fr', flag:'🇫🇷', label:'Français' },
  { code:'pt', flag:'🇵🇹', label:'Português' },
  { code:'ar', flag:'🇸🇦', label:'العربية' },
  { code:'bn', flag:'🇧🇩', label:'বাংলা' },
  { code:'ru', flag:'🇷🇺', label:'Русский' },
]
const VALID_LOCALES = LOCALES.map(l => l.code)
const savedLocale = localStorage.getItem('pgbm_lang') as Locale
const locale = ref<Locale>(VALID_LOCALES.includes(savedLocale) ? savedLocale : 'id')
function applyDir(l: Locale) { document.documentElement.setAttribute('dir', l === 'ar' ? 'rtl' : 'ltr') }
applyDir(locale.value)
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
  },
  zh: {
    // Navigation
    dashboard:'仪表盘', pools:'Pools', clients:'客户端', servers:'服务器',
    stats:'统计', databases:'数据库', configuration:'配置',
    manage_servers:'管理服务器', users:'用户', audit_log:'审计日志',
    backup:'备份与恢复', branding:'身份标识',
    // Auth
    login:'登录', logout:'退出登录', change_password:'修改密码',
    old_password:'旧密码', new_password:'新密码',
    // Common
    username:'用户名', password:'密码', role:'角色', label:'标签',
    save:'保存', cancel:'取消', delete:'删除', edit:'编辑', add:'添加',
    test:'测试', active:'活跃', loading:'加载中...', no_data:'暂无数据',
    filter:'筛选...', updated:'更新时间', just_now:'刚刚', refresh:'刷新',
    // Service
    service:'PgBouncer 服务', start:'启动', stop:'停止', restart:'重启',
    reload_config:'重新加载配置', pause:'暂停', resume:'恢复', kill:'终止',
    // Metrics
    cl_active:'活跃客户端', cl_waiting:'等待中的客户端',
    sv_active:'活跃服务器', sv_idle:'空闲服务器',
    max_wait:'最大等待时间', pool_count:'活跃 Pool 数',
    // Pool mode
    session_mode:'session', transaction_mode:'transaction', statement_mode:'statement',
    // Confirmations
    confirm_stop:'确定要停止 PgBouncer 吗？所有连接都将断开。',
    confirm_restart:'确定要重启 PgBouncer 吗？',
    confirm_delete:'删除 "%s"？此操作无法撤销。',
    confirm_kill:'终止所有到 "%s" 的连接？',
    confirm_pause:'暂停数据库 "%s"？',
    // Users
    admin:'管理员', viewer:'只读用户',
    confirm_delete_user:'删除用户 "%s"？此操作无法撤销。',
    user_added:'用户 "%s" 添加成功',
    role_updated:'角色更新成功',
    password_changed:'密码修改成功',
    // Server manage
    server_list:'PgBouncer 服务器列表', add_server:'添加新服务器',
    edit_server:'编辑服务器', server_added:'服务器 "%s" 添加成功',
    server_updated:'服务器 "%s" 更新成功',
    server_deleted:'服务器 "%s" 已删除',
    connected:'已连接', cannot_delete_last:'无法删除最后一个服务器',
    // Server form
    server_id:'服务器 ID', server_label:'标签', admin_host:'Admin Host',
    admin_port:'Admin Port', admin_user:'Admin User', admin_password:'Admin Password',
    password_keep:'（留空 = 保持不变）', service_name:'服务名称',
    control_mode:'控制模式', control_ssh:'SSH（远程服务器）',
    control_local:'Local（直接 systemctl）',
    ssh_host:'SSH Host', ssh_port:'SSH Port', ssh_user:'SSH User',
    ssh_key_path:'SSH Key 路径', use_sudo:'运行 systemctl 时使用 sudo',
    ini_path:'pgbouncer.ini 路径（可选，仅用于 local 模式）',
    id_hint:'小写字母、数字、- 和 _。保存后无法更改。',
    key_hint:'容器内部的路径。',
    // Config
    runtime_set:'SET 参数（运行时）', changeable_only:'仅适用于 Changeable = yes 的参数',
    show_config:'SHOW CONFIG（运行时）', pool_mode_per_db:'按数据库修改 Pool Mode',
    edit_ini_reload:'编辑 pgbouncer.ini + 自动 RELOAD',
    global_setting:'修改全局设置（pgbouncer.ini）',
    field_name:'字段名称', new_value:'新值',
    apply_reload:'应用 + 重新加载', select_database:'选择数据库',
    // Stats
    total_requests:'总请求数', total_received:'总接收量',
    total_sent:'总发送量', stats_per_db:'按数据库统计',
    // Backup
    backup_download:'下载备份', backup_restore:'从文件恢复',
    backup_note:'备份内容包括 servers.json 和 users.json',
    backup_success:'备份下载成功',
    restore_confirm:'恢复操作将覆盖服务器和用户数据，是否继续？',
    restore_success:'恢复成功',
    // Alerts
    alerts_title:'告警配置', cl_waiting_threshold:'CL Waiting 阈值',
    maxwait_threshold:'Max Wait 阈值（毫秒）', alerts_enabled:'启用告警',
    alerts_saved:'告警配置已保存',
    // Theme/Lang
    theme_dark:'深色主题', theme_light:'浅色主题', profile:'个人资料',
    // Warnings
    warn_waiting:'有 %s 个客户端正在等待连接，请考虑增加 pool_size。',
    warn_maxwait:'最大等待时间 %s 毫秒 — 检测到 Pool 瓶颈。',
    // Misc
    version:'版本', host:'主机', port:'端口', database:'数据库',
    user:'用户', mode:'模式', state:'状态', type:'类型',
    actions:'操作', name:'名称', current:'当前', paused:'已暂停',
    disabled:'已禁用', pool_size:'Pool 大小', max_conn:'最大连接数',
    connect_time:'连接时间', request_time:'请求时间',
    close_needed:'需要关闭', changeable:'可修改', description:'描述',
    pause_all:'全部暂停', resume_all:'全部恢复',
    key:'Key', value:'值',
    // Branding
    branding_identity:'应用身份标识', branding_identity_hint:'此应用及组织名称会显示在登录页面、侧边栏和页脚。',
    app_name:'应用名称', app_sub:'副标题', company_name:'公司 / 组织名称',
    company_name_placeholder:'例如：您的公司名称',
    logo:'Logo', logo_hint:'支持 PNG、JPEG、WEBP 或 SVG 格式，最大 2MB。显示在侧边栏、登录页面和浏览器标签页。',
    logo_active:'自定义 Logo 已启用', logo_default:'使用默认图标（◈）',
    upload:'上传', reset_logo:'重置为默认', choose_file_first:'请先选择 Logo 文件',
    confirm_reset_logo:'删除自定义 Logo 并恢复为默认图标？',
    branding_saved:'应用身份标识已保存', logo_uploaded:'Logo 上传成功', logo_reset:'Logo 已重置为默认',
  },
  hi: {
    // Navigation
    dashboard:'Dashboard', pools:'Pools', clients:'Clients', servers:'Servers',
    stats:'Stats', databases:'Databases', configuration:'कॉन्फ़िगरेशन',
    manage_servers:'सर्वर प्रबंधित करें', users:'उपयोगकर्ता', audit_log:'Audit Log',
    backup:'बैकअप और रीस्टोर', branding:'पहचान',
    // Auth
    login:'लॉगिन', logout:'लॉगआउट', change_password:'पासवर्ड बदलें',
    old_password:'पुराना पासवर्ड', new_password:'नया पासवर्ड',
    // Common
    username:'यूज़रनेम', password:'पासवर्ड', role:'रोल', label:'लेबल',
    save:'सेव करें', cancel:'रद्द करें', delete:'हटाएं', edit:'एडिट', add:'जोड़ें',
    test:'टेस्ट', active:'सक्रिय', loading:'लोड हो रहा है...', no_data:'कोई डेटा नहीं',
    filter:'फ़िल्टर...', updated:'अपडेट किया गया', just_now:'अभी-अभी', refresh:'रीफ्रेश',
    // Service
    service:'PgBouncer सर्विस', start:'शुरू करें', stop:'रोकें', restart:'रीस्टार्ट करें',
    reload_config:'कॉन्फ़िग रीलोड करें', pause:'रोकें (Pause)', resume:'फिर से शुरू करें', kill:'Kill करें',
    // Metrics
    cl_active:'सक्रिय क्लाइंट्स', cl_waiting:'प्रतीक्षारत क्लाइंट्स',
    sv_active:'सक्रिय सर्वर', sv_idle:'निष्क्रिय सर्वर',
    max_wait:'अधिकतम प्रतीक्षा समय', pool_count:'सक्रिय Pools',
    // Pool mode
    session_mode:'session', transaction_mode:'transaction', statement_mode:'statement',
    // Confirmations
    confirm_stop:'क्या आप वाकई PgBouncer रोकना चाहते हैं? सभी कनेक्शन टूट जाएंगे।',
    confirm_restart:'क्या आप वाकई PgBouncer रीस्टार्ट करना चाहते हैं?',
    confirm_delete:'"%s" हटाएं? यह क्रिया पूर्ववत नहीं की जा सकती।',
    confirm_kill:'"%s" के सभी कनेक्शन Kill करें?',
    confirm_pause:'डेटाबेस "%s" को Pause करें?',
    // Users
    admin:'एडमिन', viewer:'व्यूअर',
    confirm_delete_user:'उपयोगकर्ता "%s" हटाएं? यह क्रिया पूर्ववत नहीं की जा सकती।',
    user_added:'उपयोगकर्ता "%s" सफलतापूर्वक जोड़ा गया',
    role_updated:'रोल सफलतापूर्वक अपडेट हो गया',
    password_changed:'पासवर्ड सफलतापूर्वक बदल दिया गया',
    // Server manage
    server_list:'PgBouncer सर्वर सूची', add_server:'नया सर्वर जोड़ें',
    edit_server:'सर्वर एडिट करें', server_added:'सर्वर "%s" सफलतापूर्वक जोड़ा गया',
    server_updated:'सर्वर "%s" सफलतापूर्वक अपडेट हो गया',
    server_deleted:'सर्वर "%s" हटा दिया गया',
    connected:'कनेक्टेड', cannot_delete_last:'आखिरी सर्वर हटाया नहीं जा सकता',
    // Server form
    server_id:'सर्वर ID', server_label:'लेबल', admin_host:'Admin Host',
    admin_port:'Admin Port', admin_user:'Admin User', admin_password:'Admin Password',
    password_keep:'(खाली छोड़ें = मौजूदा बना रहे)', service_name:'सर्विस का नाम',
    control_mode:'कंट्रोल मोड', control_ssh:'SSH (अलग सर्वर)',
    control_local:'Local (सीधा systemctl)',
    ssh_host:'SSH Host', ssh_port:'SSH Port', ssh_user:'SSH User',
    ssh_key_path:'SSH Key पाथ', use_sudo:'systemctl चलाते समय sudo इस्तेमाल करें',
    ini_path:'pgbouncer.ini पाथ (वैकल्पिक, केवल local मोड के लिए)',
    id_hint:'छोटे अक्षर, अंक, - और _। सेव करने के बाद बदला नहीं जा सकता।',
    key_hint:'container के अंदर का पाथ।',
    // Config
    runtime_set:'SET पैरामीटर (Runtime)', changeable_only:'केवल उन पैरामीटर्स के लिए जिनका Changeable = yes है',
    show_config:'SHOW CONFIG (Runtime)', pool_mode_per_db:'हर डेटाबेस के लिए Pool Mode बदलें',
    edit_ini_reload:'pgbouncer.ini एडिट करें + ऑटो RELOAD',
    global_setting:'ग्लोबल सेटिंग बदलें (pgbouncer.ini)',
    field_name:'फ़ील्ड का नाम', new_value:'नया मान',
    apply_reload:'लागू करें + Reload', select_database:'डेटाबेस चुनें',
    // Stats
    total_requests:'कुल Requests', total_received:'कुल प्राप्त',
    total_sent:'कुल भेजा गया', stats_per_db:'हर डेटाबेस के Stats',
    // Backup
    backup_download:'बैकअप डाउनलोड करें', backup_restore:'फ़ाइल से रीस्टोर करें',
    backup_note:'बैकअप में servers.json और users.json शामिल हैं',
    backup_success:'बैकअप सफलतापूर्वक डाउनलोड हो गया',
    restore_confirm:'रीस्टोर करने से सर्वर और उपयोगकर्ता डेटा ओवरराइट हो जाएगा। जारी रखें?',
    restore_success:'रीस्टोर सफल रहा',
    // Alerts
    alerts_title:'अलर्ट कॉन्फ़िगरेशन', cl_waiting_threshold:'CL Waiting थ्रेशहोल्ड',
    maxwait_threshold:'Max Wait थ्रेशहोल्ड (ms)', alerts_enabled:'अलर्ट सक्रिय',
    alerts_saved:'अलर्ट कॉन्फ़िगरेशन सेव हो गया',
    // Theme/Lang
    theme_dark:'डार्क थीम', theme_light:'लाइट थीम', profile:'प्रोफ़ाइल',
    // Warnings
    warn_waiting:'%s क्लाइंट्स कनेक्शन का इंतज़ार कर रहे हैं। pool_size बढ़ाने पर विचार करें।',
    warn_maxwait:'अधिकतम प्रतीक्षा समय %s ms — एक Pool में bottleneck पाया गया।',
    // Misc
    version:'वर्शन', host:'होस्ट', port:'पोर्ट', database:'डेटाबेस',
    user:'यूज़र', mode:'मोड', state:'स्थिति', type:'टाइप',
    actions:'एक्शन', name:'नाम', current:'वर्तमान', paused:'रोका गया',
    disabled:'निष्क्रिय', pool_size:'Pool Size', max_conn:'अधिकतम कनेक्शन',
    connect_time:'कनेक्ट समय', request_time:'रिक्वेस्ट समय',
    close_needed:'बंद करना ज़रूरी', changeable:'बदला जा सकता है', description:'विवरण',
    pause_all:'सभी Pause करें', resume_all:'सभी Resume करें',
    key:'Key', value:'मान',
    // Branding
    branding_identity:'ऐप पहचान', branding_identity_hint:'यह ऐप और ऑर्गनाइज़ेशन का नाम लॉगिन पेज, sidebar, और footer में दिखता है।',
    app_name:'ऐप का नाम', app_sub:'सबटाइटल', company_name:'कंपनी / ऑर्गनाइज़ेशन का नाम',
    company_name_placeholder:'जैसे PT. आपकी कंपनी का नाम',
    logo:'Logo', logo_hint:'PNG, JPEG, WEBP, या SVG फॉर्मेट। अधिकतम 2MB। sidebar, लॉगिन पेज, और ब्राउज़र टैब में दिखता है।',
    logo_active:'कस्टम लोगो सक्रिय है', logo_default:'डिफ़ॉल्ट आइकन (◈) इस्तेमाल हो रहा है',
    upload:'अपलोड करें', reset_logo:'डिफ़ॉल्ट पर रीसेट करें', choose_file_first:'पहले लोगो फ़ाइल चुनें',
    confirm_reset_logo:'कस्टम लोगो हटाकर डिफ़ॉल्ट आइकन पर वापस जाएं?',
    branding_saved:'ऐप पहचान सेव हो गई', logo_uploaded:'लोगो सफलतापूर्वक अपलोड हो गया', logo_reset:'लोगो डिफ़ॉल्ट पर रीसेट हो गया',
  },
  es: {
    // Navigation
    dashboard:'Dashboard', pools:'Pools', clients:'Clientes', servers:'Servidores',
    stats:'Estadísticas', databases:'Bases de datos', configuration:'Configuración',
    manage_servers:'Gestionar Servidores', users:'Usuarios', audit_log:'Registro de Auditoría',
    backup:'Copia de Seguridad', branding:'Identidad',
    // Auth
    login:'Iniciar sesión', logout:'Cerrar sesión', change_password:'Cambiar Contraseña',
    old_password:'Contraseña Actual', new_password:'Nueva Contraseña',
    // Common
    username:'Usuario', password:'Contraseña', role:'Rol', label:'Etiqueta',
    save:'Guardar', cancel:'Cancelar', delete:'Eliminar', edit:'Editar', add:'Añadir',
    test:'Probar', active:'Activo', loading:'Cargando...', no_data:'Sin datos',
    filter:'Filtrar...', updated:'Actualizado', just_now:'justo ahora', refresh:'Actualizar',
    // Service
    service:'Servicio PgBouncer', start:'Iniciar', stop:'Detener', restart:'Reiniciar',
    reload_config:'Recargar Config', pause:'Pausar', resume:'Reanudar', kill:'Finalizar',
    // Metrics
    cl_active:'Clientes Activos', cl_waiting:'Clientes en Espera',
    sv_active:'Servidores Activos', sv_idle:'Servidores Inactivos',
    max_wait:'Espera Máxima', pool_count:'Pools Activos',
    // Pool mode
    session_mode:'session', transaction_mode:'transaction', statement_mode:'statement',
    // Confirmations
    confirm_stop:'¿Detener PgBouncer? Se cerrarán todas las conexiones.',
    confirm_restart:'¿Reiniciar PgBouncer?',
    confirm_delete:'¿Eliminar "%s"? Esta acción no se puede deshacer.',
    confirm_kill:'¿Finalizar todas las conexiones a "%s"?',
    confirm_pause:'¿Pausar la base de datos "%s"?',
    // Users
    admin:'Admin', viewer:'Viewer',
    confirm_delete_user:'¿Eliminar al usuario "%s"? Esta acción no se puede deshacer.',
    user_added:'Usuario "%s" añadido correctamente',
    role_updated:'Rol actualizado correctamente',
    password_changed:'Contraseña cambiada correctamente',
    // Server manage
    server_list:'Lista de Servidores PgBouncer', add_server:'Añadir Nuevo Servidor',
    edit_server:'Editar Servidor', server_added:'Servidor "%s" añadido correctamente',
    server_updated:'Servidor "%s" actualizado correctamente',
    server_deleted:'Servidor "%s" eliminado',
    connected:'Conectado', cannot_delete_last:'No se puede eliminar el último servidor',
    // Server form
    server_id:'ID del Servidor', server_label:'Etiqueta', admin_host:'Admin Host',
    admin_port:'Admin Port', admin_user:'Admin User', admin_password:'Admin Password',
    password_keep:'(dejar en blanco = mantener la actual)', service_name:'Nombre del Servicio',
    control_mode:'Modo de Control', control_ssh:'SSH (servidor remoto)',
    control_local:'Local (systemctl directo)',
    ssh_host:'SSH Host', ssh_port:'SSH Port', ssh_user:'SSH User',
    ssh_key_path:'Ruta de la Clave SSH', use_sudo:'Usar sudo al ejecutar systemctl',
    ini_path:'Ruta de pgbouncer.ini (opcional, para modo local)',
    id_hint:'Letras minúsculas, números, - y _. No se puede cambiar después de guardar.',
    key_hint:'Ruta dentro del contenedor.',
    // Config
    runtime_set:'SET de Parámetro (Runtime)', changeable_only:'Solo para parámetros con Changeable = yes',
    show_config:'SHOW CONFIG (Runtime)', pool_mode_per_db:'Cambiar Pool Mode por Base de Datos',
    edit_ini_reload:'Editar pgbouncer.ini + RELOAD automático',
    global_setting:'Cambiar Configuración Global (pgbouncer.ini)',
    field_name:'Nombre del campo', new_value:'Nuevo valor',
    apply_reload:'Aplicar + Recargar', select_database:'Seleccionar base de datos',
    // Stats
    total_requests:'Total de Solicitudes', total_received:'Total Recibido',
    total_sent:'Total Enviado', stats_per_db:'Estadísticas por Base de Datos',
    // Backup
    backup_download:'Descargar Copia de Seguridad', backup_restore:'Restaurar desde Archivo',
    backup_note:'La copia de seguridad contiene servers.json y users.json',
    backup_success:'Copia de seguridad descargada correctamente',
    restore_confirm:'La restauración sobrescribirá los datos de servidores y usuarios. ¿Continuar?',
    restore_success:'Restauración exitosa',
    // Alerts
    alerts_title:'Configuración de Alertas', cl_waiting_threshold:'Umbral de CL Waiting',
    maxwait_threshold:'Umbral de Max Wait (ms)', alerts_enabled:'Alertas activadas',
    alerts_saved:'Configuración de alertas guardada',
    // Theme/Lang
    theme_dark:'Tema Oscuro', theme_light:'Tema Claro', profile:'Perfil',
    // Warnings
    warn_waiting:'%s clientes están esperando conexión. Considera aumentar el pool_size.',
    warn_maxwait:'Espera máxima de %s ms — se detectó un cuello de botella en un pool.',
    // Misc
    version:'Versión', host:'Host', port:'Puerto', database:'Base de datos',
    user:'Usuario', mode:'Modo', state:'Estado', type:'Tipo',
    actions:'Acciones', name:'Nombre', current:'Actual', paused:'Pausado',
    disabled:'Desactivado', pool_size:'Pool Size', max_conn:'Conexiones Máximas',
    connect_time:'Tiempo de Conexión', request_time:'Tiempo de Solicitud',
    close_needed:'Requiere Cierre', changeable:'Modificable', description:'Descripción',
    pause_all:'Pausar Todo', resume_all:'Reanudar Todo',
    key:'Key', value:'Valor',
    // Branding
    branding_identity:'Identidad de la Aplicación', branding_identity_hint:'Este nombre de app y organización aparece en la página de inicio de sesión, la barra lateral y el pie de página.',
    app_name:'Nombre de la App', app_sub:'Subtítulo', company_name:'Nombre de la Empresa / Organización',
    company_name_placeholder:'ej. Nombre de su Empresa S.A.',
    logo:'Logo', logo_hint:'Formato PNG, JPEG, WEBP o SVG. Máx. 2MB. Se muestra en la barra lateral, la página de inicio de sesión y la pestaña del navegador.',
    logo_active:'Logo personalizado activo', logo_default:'Usando el ícono por defecto (◈)',
    upload:'Subir', reset_logo:'Restablecer al Predeterminado', choose_file_first:'Elige primero un archivo de logo',
    confirm_reset_logo:'¿Eliminar el logo personalizado y volver al ícono por defecto?',
    branding_saved:'Identidad de la aplicación guardada', logo_uploaded:'Logo subido correctamente', logo_reset:'Logo restablecido al predeterminado',
  },
  fr: {
    // Navigation
    dashboard:'Dashboard', pools:'Pools', clients:'Clients', servers:'Serveurs',
    stats:'Statistiques', databases:'Bases de données', configuration:'Configuration',
    manage_servers:'Gérer les Serveurs', users:'Utilisateurs', audit_log:'Journal d\'Audit',
    backup:'Sauvegarde & Restauration', branding:'Identité',
    // Auth
    login:'Connexion', logout:'Déconnexion', change_password:'Changer le Mot de Passe',
    old_password:'Ancien Mot de Passe', new_password:'Nouveau Mot de Passe',
    // Common
    username:'Nom d\'utilisateur', password:'Mot de passe', role:'Rôle', label:'Libellé',
    save:'Enregistrer', cancel:'Annuler', delete:'Supprimer', edit:'Modifier', add:'Ajouter',
    test:'Tester', active:'Actif', loading:'Chargement...', no_data:'Aucune donnée',
    filter:'Filtrer...', updated:'Mis à jour', just_now:'à l\'instant', refresh:'Actualiser',
    // Service
    service:'Service PgBouncer', start:'Démarrer', stop:'Arrêter', restart:'Redémarrer',
    reload_config:'Recharger la Config', pause:'Pause', resume:'Reprendre', kill:'Terminer',
    // Metrics
    cl_active:'Clients Actifs', cl_waiting:'Clients en Attente',
    sv_active:'Serveurs Actifs', sv_idle:'Serveurs Inactifs',
    max_wait:'Attente Max', pool_count:'Pools Actifs',
    // Pool mode
    session_mode:'session', transaction_mode:'transaction', statement_mode:'statement',
    // Confirmations
    confirm_stop:'Arrêter PgBouncer ? Toutes les connexions seront interrompues.',
    confirm_restart:'Redémarrer PgBouncer ?',
    confirm_delete:'Supprimer "%s" ? Cette action est irréversible.',
    confirm_kill:'Terminer toutes les connexions vers "%s" ?',
    confirm_pause:'Mettre en pause la base de données "%s" ?',
    // Users
    admin:'Admin', viewer:'Lecteur',
    confirm_delete_user:'Supprimer l\'utilisateur "%s" ? Cette action est irréversible.',
    user_added:'Utilisateur "%s" ajouté avec succès',
    role_updated:'Rôle mis à jour avec succès',
    password_changed:'Mot de passe modifié avec succès',
    // Server manage
    server_list:'Liste des Serveurs PgBouncer', add_server:'Ajouter un Nouveau Serveur',
    edit_server:'Modifier le Serveur', server_added:'Serveur "%s" ajouté avec succès',
    server_updated:'Serveur "%s" mis à jour avec succès',
    server_deleted:'Serveur "%s" supprimé',
    connected:'Connecté', cannot_delete_last:'Impossible de supprimer le dernier serveur',
    // Server form
    server_id:'ID du Serveur', server_label:'Libellé', admin_host:'Admin Host',
    admin_port:'Admin Port', admin_user:'Admin User', admin_password:'Admin Password',
    password_keep:'(laisser vide = conserver l\'actuel)', service_name:'Nom du Service',
    control_mode:'Mode de Contrôle', control_ssh:'SSH (serveur distant)',
    control_local:'Local (systemctl direct)',
    ssh_host:'SSH Host', ssh_port:'SSH Port', ssh_user:'SSH User',
    ssh_key_path:'Chemin de la Clé SSH', use_sudo:'Utiliser sudo lors de l\'exécution de systemctl',
    ini_path:'Chemin de pgbouncer.ini (optionnel, pour le mode local)',
    id_hint:'Lettres minuscules, chiffres, - et _. Ne peut pas être modifié après l\'enregistrement.',
    key_hint:'Chemin à l\'intérieur du conteneur.',
    // Config
    runtime_set:'SET de Paramètre (Runtime)', changeable_only:'Uniquement pour les paramètres avec Changeable = yes',
    show_config:'SHOW CONFIG (Runtime)', pool_mode_per_db:'Changer le Pool Mode par Base de Données',
    edit_ini_reload:'Modifier pgbouncer.ini + RELOAD automatique',
    global_setting:'Modifier les Paramètres Globaux (pgbouncer.ini)',
    field_name:'Nom du champ', new_value:'Nouvelle valeur',
    apply_reload:'Appliquer + Recharger', select_database:'Sélectionner la base de données',
    // Stats
    total_requests:'Total des Requêtes', total_received:'Total Reçu',
    total_sent:'Total Envoyé', stats_per_db:'Statistiques par Base de Données',
    // Backup
    backup_download:'Télécharger la Sauvegarde', backup_restore:'Restaurer depuis un Fichier',
    backup_note:'La sauvegarde contient servers.json et users.json',
    backup_success:'Sauvegarde téléchargée avec succès',
    restore_confirm:'La restauration écrasera les données des serveurs et des utilisateurs. Continuer ?',
    restore_success:'Restauration réussie',
    // Alerts
    alerts_title:'Configuration des Alertes', cl_waiting_threshold:'Seuil de CL Waiting',
    maxwait_threshold:'Seuil de Max Wait (ms)', alerts_enabled:'Alertes activées',
    alerts_saved:'Configuration des alertes enregistrée',
    // Theme/Lang
    theme_dark:'Thème Sombre', theme_light:'Thème Clair', profile:'Profil',
    // Warnings
    warn_waiting:'%s clients sont en attente de connexion. Envisagez d\'augmenter le pool_size.',
    warn_maxwait:'Attente max de %s ms — un goulot d\'étranglement a été détecté sur un pool.',
    // Misc
    version:'Version', host:'Hôte', port:'Port', database:'Base de données',
    user:'Utilisateur', mode:'Mode', state:'État', type:'Type',
    actions:'Actions', name:'Nom', current:'Actuel', paused:'En Pause',
    disabled:'Désactivé', pool_size:'Pool Size', max_conn:'Connexions Max',
    connect_time:'Temps de Connexion', request_time:'Temps de Requête',
    close_needed:'Fermeture Nécessaire', changeable:'Modifiable', description:'Description',
    pause_all:'Tout Mettre en Pause', resume_all:'Tout Reprendre',
    key:'Key', value:'Valeur',
    // Branding
    branding_identity:'Identité de l\'Application', branding_identity_hint:'Ce nom d\'application et d\'organisation apparaît sur la page de connexion, la barre latérale et le pied de page.',
    app_name:'Nom de l\'App', app_sub:'Sous-titre', company_name:'Nom de l\'Entreprise / Organisation',
    company_name_placeholder:'ex. Nom de Votre Entreprise',
    logo:'Logo', logo_hint:'Format PNG, JPEG, WEBP ou SVG. Max 2MB. Affiché dans la barre latérale, la page de connexion et l\'onglet du navigateur.',
    logo_active:'Logo personnalisé actif', logo_default:'Utilise l\'icône par défaut (◈)',
    upload:'Téléverser', reset_logo:'Réinitialiser par Défaut', choose_file_first:'Choisissez d\'abord un fichier de logo',
    confirm_reset_logo:'Supprimer le logo personnalisé et revenir à l\'icône par défaut ?',
    branding_saved:'Identité de l\'application enregistrée', logo_uploaded:'Logo téléversé avec succès', logo_reset:'Logo réinitialisé par défaut',
  },
  pt: {
    // Navigation
    dashboard:'Dashboard', pools:'Pools', clients:'Clientes', servers:'Servidores',
    stats:'Estatísticas', databases:'Bancos de Dados', configuration:'Configuração',
    manage_servers:'Gerenciar Servidores', users:'Usuários', audit_log:'Log de Auditoria',
    backup:'Backup & Restauração', branding:'Identidade',
    // Auth
    login:'Entrar', logout:'Sair', change_password:'Alterar Senha',
    old_password:'Senha Atual', new_password:'Nova Senha',
    // Common
    username:'Usuário', password:'Senha', role:'Função', label:'Rótulo',
    save:'Salvar', cancel:'Cancelar', delete:'Excluir', edit:'Editar', add:'Adicionar',
    test:'Testar', active:'Ativo', loading:'Carregando...', no_data:'Sem dados',
    filter:'Filtrar...', updated:'Atualizado', just_now:'agora mesmo', refresh:'Atualizar',
    // Service
    service:'Serviço PgBouncer', start:'Iniciar', stop:'Parar', restart:'Reiniciar',
    reload_config:'Recarregar Config', pause:'Pausar', resume:'Retomar', kill:'Encerrar',
    // Metrics
    cl_active:'Clientes Ativos', cl_waiting:'Clientes em Espera',
    sv_active:'Servidores Ativos', sv_idle:'Servidores Ociosos',
    max_wait:'Espera Máxima', pool_count:'Pools Ativos',
    // Pool mode
    session_mode:'session', transaction_mode:'transaction', statement_mode:'statement',
    // Confirmations
    confirm_stop:'Parar o PgBouncer? Todas as conexões serão encerradas.',
    confirm_restart:'Reiniciar o PgBouncer?',
    confirm_delete:'Excluir "%s"? Esta ação não pode ser desfeita.',
    confirm_kill:'Encerrar todas as conexões com "%s"?',
    confirm_pause:'Pausar o banco de dados "%s"?',
    // Users
    admin:'Admin', viewer:'Visualizador',
    confirm_delete_user:'Excluir o usuário "%s"? Esta ação não pode ser desfeita.',
    user_added:'Usuário "%s" adicionado com sucesso',
    role_updated:'Função atualizada com sucesso',
    password_changed:'Senha alterada com sucesso',
    // Server manage
    server_list:'Lista de Servidores PgBouncer', add_server:'Adicionar Novo Servidor',
    edit_server:'Editar Servidor', server_added:'Servidor "%s" adicionado com sucesso',
    server_updated:'Servidor "%s" atualizado com sucesso',
    server_deleted:'Servidor "%s" excluído',
    connected:'Conectado', cannot_delete_last:'Não é possível excluir o último servidor',
    // Server form
    server_id:'ID do Servidor', server_label:'Rótulo', admin_host:'Admin Host',
    admin_port:'Admin Port', admin_user:'Admin User', admin_password:'Admin Password',
    password_keep:'(deixe em branco = manter a atual)', service_name:'Nome do Serviço',
    control_mode:'Modo de Controle', control_ssh:'SSH (servidor remoto)',
    control_local:'Local (systemctl direto)',
    ssh_host:'SSH Host', ssh_port:'SSH Port', ssh_user:'SSH User',
    ssh_key_path:'Caminho da Chave SSH', use_sudo:'Usar sudo ao executar systemctl',
    ini_path:'Caminho do pgbouncer.ini (opcional, para modo local)',
    id_hint:'Letras minúsculas, números, - e _. Não pode ser alterado após salvar.',
    key_hint:'Caminho dentro do container.',
    // Config
    runtime_set:'SET de Parâmetro (Runtime)', changeable_only:'Apenas para parâmetros com Changeable = yes',
    show_config:'SHOW CONFIG (Runtime)', pool_mode_per_db:'Alterar Pool Mode por Banco de Dados',
    edit_ini_reload:'Editar pgbouncer.ini + RELOAD automático',
    global_setting:'Alterar Configuração Global (pgbouncer.ini)',
    field_name:'Nome do campo', new_value:'Novo valor',
    apply_reload:'Aplicar + Recarregar', select_database:'Selecionar banco de dados',
    // Stats
    total_requests:'Total de Requisições', total_received:'Total Recebido',
    total_sent:'Total Enviado', stats_per_db:'Estatísticas por Banco de Dados',
    // Backup
    backup_download:'Baixar Backup', backup_restore:'Restaurar de Arquivo',
    backup_note:'O backup contém servers.json e users.json',
    backup_success:'Backup baixado com sucesso',
    restore_confirm:'A restauração sobrescreverá os dados de servidores e usuários. Continuar?',
    restore_success:'Restauração bem-sucedida',
    // Alerts
    alerts_title:'Configuração de Alertas', cl_waiting_threshold:'Limite de CL Waiting',
    maxwait_threshold:'Limite de Max Wait (ms)', alerts_enabled:'Alertas ativados',
    alerts_saved:'Configuração de alertas salva',
    // Theme/Lang
    theme_dark:'Tema Escuro', theme_light:'Tema Claro', profile:'Perfil',
    // Warnings
    warn_waiting:'%s clientes estão aguardando conexão. Considere aumentar o pool_size.',
    warn_maxwait:'Espera máxima de %s ms — gargalo detectado em um pool.',
    // Misc
    version:'Versão', host:'Host', port:'Porta', database:'Banco de Dados',
    user:'Usuário', mode:'Modo', state:'Estado', type:'Tipo',
    actions:'Ações', name:'Nome', current:'Atual', paused:'Pausado',
    disabled:'Desativado', pool_size:'Pool Size', max_conn:'Conexões Máximas',
    connect_time:'Tempo de Conexão', request_time:'Tempo de Requisição',
    close_needed:'Fechamento Necessário', changeable:'Alterável', description:'Descrição',
    pause_all:'Pausar Todos', resume_all:'Retomar Todos',
    key:'Key', value:'Valor',
    // Branding
    branding_identity:'Identidade do Aplicativo', branding_identity_hint:'Este nome de app e organização aparece na página de login, barra lateral e rodapé.',
    app_name:'Nome do App', app_sub:'Subtítulo', company_name:'Nome da Empresa / Organização',
    company_name_placeholder:'ex. Nome da Sua Empresa Ltda.',
    logo:'Logo', logo_hint:'Formato PNG, JPEG, WEBP ou SVG. Máx. 2MB. Exibido na barra lateral, página de login e aba do navegador.',
    logo_active:'Logo personalizado ativo', logo_default:'Usando o ícone padrão (◈)',
    upload:'Enviar', reset_logo:'Redefinir para Padrão', choose_file_first:'Escolha primeiro um arquivo de logo',
    confirm_reset_logo:'Remover o logo personalizado e voltar ao ícone padrão?',
    branding_saved:'Identidade do aplicativo salva', logo_uploaded:'Logo enviado com sucesso', logo_reset:'Logo redefinido para o padrão',
  },
  ar: {
    // Navigation
    dashboard:'لوحة التحكم', pools:'Pools', clients:'العملاء', servers:'الخوادم',
    stats:'الإحصائيات', databases:'قواعد البيانات', configuration:'الإعدادات',
    manage_servers:'إدارة الخوادم', users:'المستخدمون', audit_log:'سجل التدقيق',
    backup:'النسخ الاحتياطي والاستعادة', branding:'الهوية',
    // Auth
    login:'تسجيل الدخول', logout:'تسجيل الخروج', change_password:'تغيير كلمة المرور',
    old_password:'كلمة المرور الحالية', new_password:'كلمة المرور الجديدة',
    // Common
    username:'اسم المستخدم', password:'كلمة المرور', role:'الدور', label:'التسمية',
    save:'حفظ', cancel:'إلغاء', delete:'حذف', edit:'تعديل', add:'إضافة',
    test:'اختبار', active:'نشط', loading:'جارٍ التحميل...', no_data:'لا توجد بيانات',
    filter:'تصفية...', updated:'آخر تحديث', just_now:'الآن', refresh:'تحديث',
    // Service
    service:'خدمة PgBouncer', start:'تشغيل', stop:'إيقاف', restart:'إعادة تشغيل',
    reload_config:'إعادة تحميل الإعدادات', pause:'إيقاف مؤقت', resume:'استئناف', kill:'إنهاء',
    // Metrics
    cl_active:'العملاء النشطون', cl_waiting:'العملاء المنتظرون',
    sv_active:'الخوادم النشطة', sv_idle:'الخوادم الخاملة',
    max_wait:'أقصى وقت انتظار', pool_count:'عدد Pools النشطة',
    // Pool mode
    session_mode:'session', transaction_mode:'transaction', statement_mode:'statement',
    // Confirmations
    confirm_stop:'هل تريد بالتأكيد إيقاف PgBouncer؟ سيتم قطع جميع الاتصالات.',
    confirm_restart:'هل تريد بالتأكيد إعادة تشغيل PgBouncer؟',
    confirm_delete:'حذف "%s"؟ لا يمكن التراجع عن هذا الإجراء.',
    confirm_kill:'إنهاء جميع الاتصالات بـ "%s"؟',
    confirm_pause:'إيقاف قاعدة البيانات "%s" مؤقتًا؟',
    // Users
    admin:'مسؤول', viewer:'مُشاهد',
    confirm_delete_user:'حذف المستخدم "%s"؟ لا يمكن التراجع عن هذا الإجراء.',
    user_added:'تمت إضافة المستخدم "%s" بنجاح',
    role_updated:'تم تحديث الدور بنجاح',
    password_changed:'تم تغيير كلمة المرور بنجاح',
    // Server manage
    server_list:'قائمة خوادم PgBouncer', add_server:'إضافة خادم جديد',
    edit_server:'تعديل الخادم', server_added:'تمت إضافة الخادم "%s" بنجاح',
    server_updated:'تم تحديث الخادم "%s" بنجاح',
    server_deleted:'تم حذف الخادم "%s"',
    connected:'متصل', cannot_delete_last:'لا يمكن حذف آخر خادم',
    // Server form
    server_id:'معرّف الخادم', server_label:'التسمية', admin_host:'Admin Host',
    admin_port:'Admin Port', admin_user:'Admin User', admin_password:'Admin Password',
    password_keep:'(اتركه فارغًا = الإبقاء على الحالية)', service_name:'اسم الخدمة',
    control_mode:'وضع التحكم', control_ssh:'SSH (خادم منفصل)',
    control_local:'Local (systemctl مباشر)',
    ssh_host:'SSH Host', ssh_port:'SSH Port', ssh_user:'SSH User',
    ssh_key_path:'مسار مفتاح SSH', use_sudo:'استخدام sudo عند تشغيل systemctl',
    ini_path:'مسار pgbouncer.ini (اختياري، لوضع local فقط)',
    id_hint:'أحرف صغيرة، أرقام، - و _. لا يمكن تغييره بعد الحفظ.',
    key_hint:'المسار داخل الحاوية (container).',
    // Config
    runtime_set:'SET لمعامل (وقت التشغيل)', changeable_only:'فقط للمعاملات التي تكون Changeable = yes',
    show_config:'SHOW CONFIG (وقت التشغيل)', pool_mode_per_db:'تغيير Pool Mode لكل قاعدة بيانات',
    edit_ini_reload:'تعديل pgbouncer.ini + RELOAD تلقائي',
    global_setting:'تغيير الإعدادات العامة (pgbouncer.ini)',
    field_name:'اسم الحقل', new_value:'القيمة الجديدة',
    apply_reload:'تطبيق + إعادة تحميل', select_database:'اختر قاعدة البيانات',
    // Stats
    total_requests:'إجمالي الطلبات', total_received:'إجمالي المستلم',
    total_sent:'إجمالي المرسل', stats_per_db:'الإحصائيات حسب قاعدة البيانات',
    // Backup
    backup_download:'تنزيل النسخة الاحتياطية', backup_restore:'الاستعادة من ملف',
    backup_note:'تحتوي النسخة الاحتياطية على servers.json و users.json',
    backup_success:'تم تنزيل النسخة الاحتياطية بنجاح',
    restore_confirm:'ستؤدي الاستعادة إلى استبدال بيانات الخوادم والمستخدمين. هل تريد المتابعة؟',
    restore_success:'تمت الاستعادة بنجاح',
    // Alerts
    alerts_title:'إعدادات التنبيهات', cl_waiting_threshold:'حد CL Waiting',
    maxwait_threshold:'حد Max Wait (ms)', alerts_enabled:'التنبيهات مفعّلة',
    alerts_saved:'تم حفظ إعدادات التنبيهات',
    // Theme/Lang
    theme_dark:'الوضع الداكن', theme_light:'الوضع الفاتح', profile:'الملف الشخصي',
    // Warnings
    warn_waiting:'يوجد %s عميل بانتظار الاتصال. فكّر في زيادة pool_size.',
    warn_maxwait:'أقصى وقت انتظار %s ms — تم اكتشاف اختناق في أحد الـ pools.',
    // Misc
    version:'الإصدار', host:'المضيف', port:'المنفذ', database:'قاعدة البيانات',
    user:'المستخدم', mode:'الوضع', state:'الحالة', type:'النوع',
    actions:'الإجراءات', name:'الاسم', current:'الحالي', paused:'متوقف مؤقتًا',
    disabled:'معطّل', pool_size:'Pool Size', max_conn:'أقصى عدد اتصالات',
    connect_time:'وقت الاتصال', request_time:'وقت الطلب',
    close_needed:'يحتاج إلى إغلاق', changeable:'قابل للتغيير', description:'الوصف',
    pause_all:'إيقاف الكل مؤقتًا', resume_all:'استئناف الكل',
    key:'Key', value:'القيمة',
    // Branding
    branding_identity:'هوية التطبيق', branding_identity_hint:'يظهر اسم التطبيق والمؤسسة هذا في صفحة تسجيل الدخول والشريط الجانبي والتذييل.',
    app_name:'اسم التطبيق', app_sub:'العنوان الفرعي', company_name:'اسم الشركة / المؤسسة',
    company_name_placeholder:'مثال: اسم شركتك',
    logo:'الشعار', logo_hint:'صيغة PNG أو JPEG أو WEBP أو SVG. بحد أقصى 2MB. يظهر في الشريط الجانبي وصفحة تسجيل الدخول وعلامة تبويب المتصفح.',
    logo_active:'الشعار المخصص مفعّل', logo_default:'يستخدم الأيقونة الافتراضية (◈)',
    upload:'رفع', reset_logo:'إعادة التعيين للافتراضي', choose_file_first:'اختر ملف الشعار أولاً',
    confirm_reset_logo:'هل تريد حذف الشعار المخصص والعودة إلى الأيقونة الافتراضية؟',
    branding_saved:'تم حفظ هوية التطبيق', logo_uploaded:'تم رفع الشعار بنجاح', logo_reset:'تمت إعادة تعيين الشعار إلى الافتراضي',
  },
  bn: {
    // Navigation
    dashboard:'Dashboard', pools:'Pools', clients:'ক্লায়েন্ট', servers:'সার্ভার',
    stats:'পরিসংখ্যান', databases:'ডেটাবেস', configuration:'কনফিগারেশন',
    manage_servers:'সার্ভার ম্যানেজ করুন', users:'ব্যবহারকারী', audit_log:'অডিট লগ',
    backup:'ব্যাকআপ ও রিস্টোর', branding:'পরিচয়',
    // Auth
    login:'লগইন', logout:'লগআউট', change_password:'পাসওয়ার্ড পরিবর্তন করুন',
    old_password:'পুরনো পাসওয়ার্ড', new_password:'নতুন পাসওয়ার্ড',
    // Common
    username:'ইউজারনেম', password:'পাসওয়ার্ড', role:'রোল', label:'লেবেল',
    save:'সংরক্ষণ করুন', cancel:'বাতিল', delete:'মুছুন', edit:'সম্পাদনা', add:'যোগ করুন',
    test:'টেস্ট', active:'সক্রিয়', loading:'লোড হচ্ছে...', no_data:'কোনো ডেটা নেই',
    filter:'ফিল্টার...', updated:'আপডেট হয়েছে', just_now:'এইমাত্র', refresh:'রিফ্রেশ',
    // Service
    service:'PgBouncer সার্ভিস', start:'শুরু করুন', stop:'বন্ধ করুন', restart:'রিস্টার্ট করুন',
    reload_config:'কনফিগ রিলোড করুন', pause:'পজ', resume:'আবার শুরু করুন', kill:'কিল করুন',
    // Metrics
    cl_active:'সক্রিয় ক্লায়েন্ট', cl_waiting:'অপেক্ষারত ক্লায়েন্ট',
    sv_active:'সক্রিয় সার্ভার', sv_idle:'নিষ্ক্রিয় সার্ভার',
    max_wait:'সর্বোচ্চ অপেক্ষার সময়', pool_count:'সক্রিয় Pool',
    // Pool mode
    session_mode:'session', transaction_mode:'transaction', statement_mode:'statement',
    // Confirmations
    confirm_stop:'আপনি কি নিশ্চিত PgBouncer বন্ধ করতে চান? সমস্ত সংযোগ বিচ্ছিন্ন হয়ে যাবে।',
    confirm_restart:'আপনি কি নিশ্চিত PgBouncer রিস্টার্ট করতে চান?',
    confirm_delete:'"%s" মুছবেন? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।',
    confirm_kill:'"%s"-এর সমস্ত সংযোগ কিল করবেন?',
    confirm_pause:'ডেটাবেস "%s" পজ করবেন?',
    // Users
    admin:'অ্যাডমিন', viewer:'ভিউয়ার',
    confirm_delete_user:'ব্যবহারকারী "%s" মুছবেন? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।',
    user_added:'ব্যবহারকারী "%s" সফলভাবে যোগ করা হয়েছে',
    role_updated:'রোল সফলভাবে আপডেট হয়েছে',
    password_changed:'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে',
    // Server manage
    server_list:'PgBouncer সার্ভার তালিকা', add_server:'নতুন সার্ভার যোগ করুন',
    edit_server:'সার্ভার সম্পাদনা করুন', server_added:'সার্ভার "%s" সফলভাবে যোগ করা হয়েছে',
    server_updated:'সার্ভার "%s" সফলভাবে আপডেট হয়েছে',
    server_deleted:'সার্ভার "%s" মুছে ফেলা হয়েছে',
    connected:'সংযুক্ত', cannot_delete_last:'শেষ সার্ভার মুছে ফেলা যাবে না',
    // Server form
    server_id:'সার্ভার ID', server_label:'লেবেল', admin_host:'Admin Host',
    admin_port:'Admin Port', admin_user:'Admin User', admin_password:'Admin Password',
    password_keep:'(খালি রাখুন = বর্তমানটি বজায় রাখুন)', service_name:'সার্ভিসের নাম',
    control_mode:'কন্ট্রোল মোড', control_ssh:'SSH (আলাদা সার্ভার)',
    control_local:'Local (সরাসরি systemctl)',
    ssh_host:'SSH Host', ssh_port:'SSH Port', ssh_user:'SSH User',
    ssh_key_path:'SSH কী পাথ', use_sudo:'systemctl চালানোর সময় sudo ব্যবহার করুন',
    ini_path:'pgbouncer.ini পাথ (ঐচ্ছিক, শুধু local মোডের জন্য)',
    id_hint:'ছোট হাতের অক্ষর, সংখ্যা, - এবং _। সংরক্ষণের পর পরিবর্তন করা যাবে না।',
    key_hint:'container-এর ভেতরের পাথ।',
    // Config
    runtime_set:'SET প্যারামিটার (Runtime)', changeable_only:'শুধুমাত্র Changeable = yes থাকা প্যারামিটারের জন্য',
    show_config:'SHOW CONFIG (Runtime)', pool_mode_per_db:'প্রতিটি ডেটাবেসের Pool Mode পরিবর্তন করুন',
    edit_ini_reload:'pgbouncer.ini এডিট + স্বয়ংক্রিয় RELOAD',
    global_setting:'গ্লোবাল সেটিং পরিবর্তন করুন (pgbouncer.ini)',
    field_name:'ফিল্ডের নাম', new_value:'নতুন মান',
    apply_reload:'প্রয়োগ + রিলোড', select_database:'ডেটাবেস নির্বাচন করুন',
    // Stats
    total_requests:'মোট Requests', total_received:'মোট গৃহীত',
    total_sent:'মোট প্রেরিত', stats_per_db:'প্রতিটি ডেটাবেসের পরিসংখ্যান',
    // Backup
    backup_download:'ব্যাকআপ ডাউনলোড করুন', backup_restore:'ফাইল থেকে রিস্টোর করুন',
    backup_note:'ব্যাকআপে servers.json এবং users.json থাকে',
    backup_success:'ব্যাকআপ সফলভাবে ডাউনলোড হয়েছে',
    restore_confirm:'রিস্টোর করলে সার্ভার ও ব্যবহারকারীর ডেটা ওভাররাইট হয়ে যাবে। চালিয়ে যাবেন?',
    restore_success:'রিস্টোর সফল হয়েছে',
    // Alerts
    alerts_title:'অ্যালার্ট কনফিগারেশন', cl_waiting_threshold:'CL Waiting থ্রেশহোল্ড',
    maxwait_threshold:'Max Wait থ্রেশহোল্ড (ms)', alerts_enabled:'অ্যালার্ট সক্রিয়',
    alerts_saved:'অ্যালার্ট কনফিগারেশন সংরক্ষিত হয়েছে',
    // Theme/Lang
    theme_dark:'ডার্ক থিম', theme_light:'লাইট থিম', profile:'প্রোফাইল',
    // Warnings
    warn_waiting:'%s টি ক্লায়েন্ট সংযোগের জন্য অপেক্ষা করছে। pool_size বাড়ানোর কথা বিবেচনা করুন।',
    warn_maxwait:'সর্বোচ্চ অপেক্ষার সময় %s ms — একটি pool-এ bottleneck শনাক্ত হয়েছে।',
    // Misc
    version:'ভার্সন', host:'হোস্ট', port:'পোর্ট', database:'ডেটাবেস',
    user:'ব্যবহারকারী', mode:'মোড', state:'অবস্থা', type:'ধরন',
    actions:'অ্যাকশন', name:'নাম', current:'বর্তমান', paused:'পজ করা হয়েছে',
    disabled:'নিষ্ক্রিয়', pool_size:'Pool Size', max_conn:'সর্বোচ্চ সংযোগ',
    connect_time:'সংযোগের সময়', request_time:'Request-এর সময়',
    close_needed:'বন্ধ করা প্রয়োজন', changeable:'পরিবর্তনযোগ্য', description:'বিবরণ',
    pause_all:'সব পজ করুন', resume_all:'সব আবার শুরু করুন',
    key:'Key', value:'মান',
    // Branding
    branding_identity:'অ্যাপের পরিচয়', branding_identity_hint:'এই অ্যাপ ও organization-এর নাম লগইন পেজ, sidebar, এবং footer-এ প্রদর্শিত হয়।',
    app_name:'অ্যাপের নাম', app_sub:'সাবটাইটেল', company_name:'কোম্পানি / organization-এর নাম',
    company_name_placeholder:'যেমন আপনার কোম্পানির নাম',
    logo:'লোগো', logo_hint:'PNG, JPEG, WEBP, অথবা SVG ফরম্যাট। সর্বোচ্চ 2MB। sidebar, লগইন পেজ, এবং ব্রাউজার ট্যাবে প্রদর্শিত হয়।',
    logo_active:'কাস্টম লোগো সক্রিয়', logo_default:'ডিফল্ট আইকন (◈) ব্যবহার করা হচ্ছে',
    upload:'আপলোড', reset_logo:'ডিফল্টে রিসেট করুন', choose_file_first:'আগে একটি লোগো ফাইল নির্বাচন করুন',
    confirm_reset_logo:'কাস্টম লোগো মুছে ডিফল্ট আইকনে ফিরে যাবেন?',
    branding_saved:'অ্যাপের পরিচয় সংরক্ষিত হয়েছে', logo_uploaded:'লোগো সফলভাবে আপলোড হয়েছে', logo_reset:'লোগো ডিফল্টে রিসেট হয়েছে',
  },
  ru: {
    // Navigation
    dashboard:'Дашборд', pools:'Pools', clients:'Клиенты', servers:'Серверы',
    stats:'Статистика', databases:'Базы данных', configuration:'Конфигурация',
    manage_servers:'Управление Серверами', users:'Пользователи', audit_log:'Журнал Аудита',
    backup:'Резервное Копирование', branding:'Идентичность',
    // Auth
    login:'Вход', logout:'Выход', change_password:'Изменить Пароль',
    old_password:'Текущий Пароль', new_password:'Новый Пароль',
    // Common
    username:'Имя пользователя', password:'Пароль', role:'Роль', label:'Метка',
    save:'Сохранить', cancel:'Отмена', delete:'Удалить', edit:'Изменить', add:'Добавить',
    test:'Тест', active:'Активен', loading:'Загрузка...', no_data:'Нет данных',
    filter:'Фильтр...', updated:'Обновлено', just_now:'только что', refresh:'Обновить',
    // Service
    service:'Сервис PgBouncer', start:'Запустить', stop:'Остановить', restart:'Перезапустить',
    reload_config:'Перезагрузить Конфиг', pause:'Пауза', resume:'Возобновить', kill:'Завершить',
    // Metrics
    cl_active:'Активные Клиенты', cl_waiting:'Клиенты в Ожидании',
    sv_active:'Активные Серверы', sv_idle:'Простаивающие Серверы',
    max_wait:'Макс. Ожидание', pool_count:'Активные Pools',
    // Pool mode
    session_mode:'session', transaction_mode:'transaction', statement_mode:'statement',
    // Confirmations
    confirm_stop:'Остановить PgBouncer? Все соединения будут разорваны.',
    confirm_restart:'Перезапустить PgBouncer?',
    confirm_delete:'Удалить "%s"? Это действие нельзя отменить.',
    confirm_kill:'Завершить все соединения с "%s"?',
    confirm_pause:'Приостановить базу данных "%s"?',
    // Users
    admin:'Админ', viewer:'Наблюдатель',
    confirm_delete_user:'Удалить пользователя "%s"? Это действие нельзя отменить.',
    user_added:'Пользователь "%s" успешно добавлен',
    role_updated:'Роль успешно обновлена',
    password_changed:'Пароль успешно изменён',
    // Server manage
    server_list:'Список Серверов PgBouncer', add_server:'Добавить Новый Сервер',
    edit_server:'Редактировать Сервер', server_added:'Сервер "%s" успешно добавлен',
    server_updated:'Сервер "%s" успешно обновлён',
    server_deleted:'Сервер "%s" удалён',
    connected:'Подключено', cannot_delete_last:'Нельзя удалить последний сервер',
    // Server form
    server_id:'ID Сервера', server_label:'Метка', admin_host:'Admin Host',
    admin_port:'Admin Port', admin_user:'Admin User', admin_password:'Admin Password',
    password_keep:'(оставить пустым = сохранить текущий)', service_name:'Имя Сервиса',
    control_mode:'Режим Управления', control_ssh:'SSH (удалённый сервер)',
    control_local:'Local (прямой systemctl)',
    ssh_host:'SSH Host', ssh_port:'SSH Port', ssh_user:'SSH User',
    ssh_key_path:'Путь к SSH-ключу', use_sudo:'Использовать sudo при запуске systemctl',
    ini_path:'Путь к pgbouncer.ini (опционально, для режима local)',
    id_hint:'Строчные буквы, цифры, - и _. Нельзя изменить после сохранения.',
    key_hint:'Путь внутри контейнера.',
    // Config
    runtime_set:'SET Параметра (Runtime)', changeable_only:'Только для параметров с Changeable = yes',
    show_config:'SHOW CONFIG (Runtime)', pool_mode_per_db:'Изменить Pool Mode для каждой БД',
    edit_ini_reload:'Редактировать pgbouncer.ini + авто-RELOAD',
    global_setting:'Изменить Глобальные Настройки (pgbouncer.ini)',
    field_name:'Имя поля', new_value:'Новое значение',
    apply_reload:'Применить + Перезагрузить', select_database:'Выбрать базу данных',
    // Stats
    total_requests:'Всего Запросов', total_received:'Всего Получено',
    total_sent:'Всего Отправлено', stats_per_db:'Статистика по Базам Данных',
    // Backup
    backup_download:'Скачать Резервную Копию', backup_restore:'Восстановить из Файла',
    backup_note:'Резервная копия содержит servers.json и users.json',
    backup_success:'Резервная копия успешно скачана',
    restore_confirm:'Восстановление перезапишет данные серверов и пользователей. Продолжить?',
    restore_success:'Восстановление выполнено успешно',
    // Alerts
    alerts_title:'Настройка Оповещений', cl_waiting_threshold:'Порог CL Waiting',
    maxwait_threshold:'Порог Max Wait (мс)', alerts_enabled:'Оповещения включены',
    alerts_saved:'Настройки оповещений сохранены',
    // Theme/Lang
    theme_dark:'Тёмная Тема', theme_light:'Светлая Тема', profile:'Профиль',
    // Warnings
    warn_waiting:'%s клиентов ожидают подключения. Рассмотрите увеличение pool_size.',
    warn_maxwait:'Макс. ожидание %s мс — обнаружено узкое место в pool.',
    // Misc
    version:'Версия', host:'Хост', port:'Порт', database:'База данных',
    user:'Пользователь', mode:'Режим', state:'Состояние', type:'Тип',
    actions:'Действия', name:'Имя', current:'Текущий', paused:'Приостановлено',
    disabled:'Отключено', pool_size:'Pool Size', max_conn:'Макс. Соединений',
    connect_time:'Время Подключения', request_time:'Время Запроса',
    close_needed:'Требуется Закрытие', changeable:'Изменяемо', description:'Описание',
    pause_all:'Приостановить Все', resume_all:'Возобновить Все',
    key:'Key', value:'Значение',
    // Branding
    branding_identity:'Идентичность Приложения', branding_identity_hint:'Это название приложения и организации отображается на странице входа, в боковой панели и в футере.',
    app_name:'Название Приложения', app_sub:'Подзаголовок', company_name:'Название Компании / Организации',
    company_name_placeholder:'напр. Название Вашей Компании',
    logo:'Логотип', logo_hint:'Формат PNG, JPEG, WEBP или SVG. Макс. 2MB. Отображается в боковой панели, на странице входа и во вкладке браузера.',
    logo_active:'Пользовательский логотип активен', logo_default:'Используется стандартная иконка (◈)',
    upload:'Загрузить', reset_logo:'Сбросить к Стандартному', choose_file_first:'Сначала выберите файл логотипа',
    confirm_reset_logo:'Удалить пользовательский логотип и вернуться к стандартной иконке?',
    branding_saved:'Идентичность приложения сохранена', logo_uploaded:'Логотип успешно загружен', logo_reset:'Логотип сброшен к стандартному',
  }
}
export function useI18n() {
  const t = (key: string, ...args: string[]) => {
    let str = M[locale.value]?.[key] ?? M['en']?.[key] ?? key
    args.forEach(a => { str = str.replace('%s', a) })
    return str
  }
  const setLocale = (l: Locale) => {
    locale.value = l
    localStorage.setItem('pgbm_lang', l)
    applyDir(l)
  }
  return { locale, t, setLocale }
}
