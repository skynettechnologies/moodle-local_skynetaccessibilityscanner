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

$PAGE->requires->css('/local/skynetaccessibilityscanner/styles.css');
$PAGE->requires->jquery();
$PAGE->requires->js(new moodle_url('/local/skynetaccessibilityscanner/iparams.js'));

$pixbaseurl = $OUTPUT->image_url('round', 'local_skynetaccessibilityscanner')->out(false);
$pixbaseurl = preg_replace('/round$/', '', $pixbaseurl);

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
