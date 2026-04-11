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

namespace local_skynetaccessibilityscanner\privacy;

use core_privacy\local\metadata\collection;

/**
 * Privacy Subsystem for local_skynetaccessibilityscanner implementing null_provider.
 *
 * @copyright 2024 Rajesh Bhimani <developer3@skynettechnologies.com>
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class provider implements \core_privacy\local\metadata\provider {
    /**
     * Returns metadata about the personal data this plugin stores.
     *
     * @param collection $collection The collection of data for the user
     * @return collection The metadata about personal data
     */
    public static function get_metadata(collection $collection): collection {
        // Declare that the plugin is exporting personal data to an external service.
        $collection->add_external_location_link(
            'domain_client',
            [
                'name'   => 'privacy:metadata:domain_client:name',
                'email'    => 'privacy:metadata:domain_client:email',
                'website' => 'privacy:metadata:domain_client:website',
            ],
            'privacy:metadata:domain_client'
        );
        return $collection;
    }
    
    /**
     * Explain why no data is stored.
     *
     * @return string
     */
    public static function get_reason(): string {
        return 'privacy:metadata';
    }
    
    
    /**
     * Returns the link to the external location where user data is sent.
     *
     * @return string The external location URL where the data is sent.
     */
    public static function get_external_location_link() {
        return 'https://skynetaccessibilityscan.com';
    }
}
