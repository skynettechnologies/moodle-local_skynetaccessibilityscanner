<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Privacy Subsystem implementation for local_skynetaccessibilityscanner.
 *
 * @package local_skynetaccessibilityscanner
 * @copyright  2024 Rajesh Bhimani <developer3@skynettechnologies.com>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once(__DIR__ . '/../../config.php');

require_login();

require_once($CFG->libdir . '/adminlib.php');

admin_externalpage_setup('local_skynetaccessibilityscanner');

$context = context_system::instance();
$PAGE->set_context($context);
$PAGE->set_url(new moodle_url('/local/skynetaccessibilityscanner/iparams.php'));
$PAGE->set_pagelayout('admin');
$PAGE->set_title(get_string('pluginname', 'local_skynetaccessibilityscanner'));
$PAGE->set_heading(get_string('pluginname', 'local_skynetaccessibilityscanner'));

$PAGE->requires->jquery();
$PAGE->requires->js(new moodle_url('/local/skynetaccessibilityscanner/iparams.js'));

$pixbaseurl = $OUTPUT->image_url('round', 'local_skynetaccessibilityscanner')->out(false);
$pixbaseurl = preg_replace('/round$/', '', $pixbaseurl);

$PAGE->requires->js_call_amd(
    'local_skynetaccessibilityscanner/iparams',
    'init',
    [
        'pixBaseUrl' => $pixbaseurl,
        'strings' => [
            'violations' => get_string('violations', 'local_skynetaccessibilityscanner'),
            'n-a' => get_string('n-a', 'local_skynetaccessibilityscanner'),
            'not-started' => get_string('not-started', 'local_skynetaccessibilityscanner'),
            'scanning' => get_string('scanning', 'local_skynetaccessibilityscanner'),
            'page' => get_string('pages', 'local_skynetaccessibilityscanner'),
            'yourPlanHasExpired' => get_string('your-plan-has-expired', 'local_skynetaccessibilityscanner'),
            'freePlan' => get_string('free-plan', 'local_skynetaccessibilityscanner'),
            'scanUpTo' => get_string('scan-up-to', 'local_skynetaccessibilityscanner'),
            'plan' => get_string('plan', 'local_skynetaccessibilityscanner'),
            'cancelledPlan' => get_string('cancelled-plan', 'local_skynetaccessibilityscanner'),
            'currentPlan' => get_string('current-plan', 'local_skynetaccessibilityscanner'),
            'expiresOn' => get_string('expires-on', 'local_skynetaccessibilityscanner'),
            'renewsOn' => get_string('renews-on', 'local_skynetaccessibilityscanner'),
            'expiredOn' => get_string('expired-on', 'local_skynetaccessibilityscanner'),
            'renewPlan' => get_string('renew-plan', 'local_skynetaccessibilityscanner'),
            'cancelSubscription' => get_string('cancel-subscription', 'local_skynetaccessibilityscanner'),
            'monthly' => get_string('monthly', 'local_skynetaccessibilityscanner'),
            'year' => get_string('year', 'local_skynetaccessibilityscanner'),
            'upgrade' => get_string('upgrade', 'local_skynetaccessibilityscanner'),
            'cancel' => get_string('cancel', 'local_skynetaccessibilityscanner'),
            'notCompliant' => get_string('not-compliant', 'local_skynetaccessibilityscanner'),
            'semiCompliant' => get_string('semi-compliant', 'local_skynetaccessibilityscanner'),
            'compliant' => get_string('compliant', 'local_skynetaccessibilityscanner'),
            'pagesScannedOutOf' => get_string('pages-scanned-out-of', 'local_skynetaccessibilityscanner'),
        ]
    ]
);

$templatecontext = [
    'img_url_round' => $OUTPUT->image_url('round', 'local_skynetaccessibilityscanner')->out(),
    'img_pricing_bg' => $OUTPUT->image_url('pricing-bg', 'local_skynetaccessibilityscanner')->out(),
    'img_plan_bg' => $OUTPUT->image_url('plan-bg', 'local_skynetaccessibilityscanner')->out(),
    'img_sitemap_bg' => $OUTPUT->image_url('sitemap-bg', 'local_skynetaccessibilityscanner')->out(),
    'pix_base_url' => $pixbaseurl,
];

echo $OUTPUT->header();

echo $OUTPUT->render_from_template(
    'local_skynetaccessibilityscanner/iparams',
    $templatecontext
);

echo $OUTPUT->footer();
