/* global jQuery */
(function($) {

    // Global data object to store API responses
    var appData = {
        websiteId: '',
        packageId: '',
        subscrInterval: '',
        paypalSubscrId: '',
        dashboardLink: '',
        violationLink: '',
        endDate: '',
        cancelDate: '',
        isExpired: false,
        plans: [],
        imagesPaths: window.AIOA_PIX_BASE
    };

    // Register domain
    function registerDomain(url) {
        var domain = url.replace(/^www\./, '');
        var formData = new URLSearchParams({
            'website': btoa(url),
            'platform': 'Gatsby',
            'is_trial_period': '1',
            'name': url,
            'email': 'no-reply@' + domain,
            'comapany_name': domain,
            'package_type': '25-pages'});

        return fetch('https://skynetaccessibilityscan.com/api/register-domain-platform', {
            method: 'POST',
            body: formData
        }).then(function(response) {
            return response.json();
        });
    }

    // Fetch scan details
    function fetchScanDetails(url) {
        var formData = new URLSearchParams({'website': btoa(url)});
        return fetch('https://skynetaccessibilityscan.com/api/get-scan-detail', {
            method: 'POST',
            body: formData
        }).then(function(response) {
            return response.json();
        }).then(function(result) {
            var data = result.data[0] || {};

            // Store in global appData
            appData.domain = data.domain || '';
            appData.favIcon = data.fav_icon || '';
            appData.urlScanStatus = data.url_scan_status || 0;
            appData.scanStatus = data.scan_status || 0;
            appData.totalSelectedPages = data.total_selected_pages || 0;
            appData.totalLastScanPages = data.total_last_scan_pages || 0;
            appData.totalPages = data.total_pages || 0;
            appData.lastUrlScan = data.last_url_scan || 0;
            appData.totalScanPages = data.total_scan_pages || 0;
            appData.lastScan = data.last_scan || null;
            appData.nextScanDate = data.next_scan_date || null;
            appData.successPercentage = data.success_percentage || '0';
            appData.scanViolationTotal = data.scan_violation_total || '0';
            appData.totalViolations = data.total_violations || 0;
            appData.packageName = data.name || '';
            appData.packageId = data.package_id || '';
            appData.pageViews = data.page_views || '';
            appData.packagePrice = data.package_price || '';
            appData.subscrInterval = data.subscr_interval || '';
            appData.endDate = data.end_date || '';
            appData.cancelDate = data.cancel_date || '';
            appData.websiteId = data.website_id || '';
            appData.paypalSubscrId = data.paypal_subscr_id || '';
            appData.isTrialPeriod = data.is_trial_period || '';
            appData.dashboardLink = result.dashboard_link || '';
            appData.totalFailSum = data.total_fail_sum || '';
            appData.isExpired = data.is_expired || '';
        });
    }

    // Fetch scan count
    function fetchScanCount(url) {
        var formData = new URLSearchParams({
            'website': btoa(url)
        });

        return fetch('https://skynetaccessibilityscan.com/api/get-scan-count', {
            method: 'POST',
            body: formData
        }).then(function(response) {
            return response.json();
        }).then(function(result) {
            var widgetPurchased = result.widget_purchased || false;
            appData.scanDetails = {
                withRemediation: widgetPurchased ? (result.scan_details.with_remediation || {}) : (result.scan_details.without_remediation || {})
            };
        });
    }

    // Fetch packages
    function fetchPackages(url) {
        return fetch('https://skynetaccessibilityscan.com/api/packages-list', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({'website': btoa(url)})
        }).then(function(response) {
            return response.json();
        }).then(function(decoded) {
            var packageData = {};
            if (decoded.current_active_package && decoded.current_active_package[appData.websiteId]) {
                packageData = decoded.current_active_package[appData.websiteId];
            } else if (decoded.expired_package_detail && decoded.expired_package_detail[appData.websiteId]) {
                packageData = decoded.expired_package_detail[appData.websiteId];
            }

            appData.finalPrice = packageData.final_price || 0;
            appData.packageId = packageData.package_id || appData.packageId;
            appData.subscrInterval = packageData.subscr_interval || appData.subscrInterval;

            // Generate violation link
            return fetch('https://skynetaccessibilityscan.com/api/generate-plan-action-link', {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: new URLSearchParams({'website_id': appData.websiteId,'current_package_id': appData.packageId,'action': 'violation'})
            }).then(function(response) {
                return response.json();
            }).then(function(violationData) {
                appData.violationLink = violationData.action_link || '#';
                // Process plans
                appData.plans = [];
                var today = new Date();

                var plans = decoded.Data || [];
                for (var i = 0; i < plans.length; i++) {
                    var plan = plans[i];
                    if (!plan.platforms || plan.platforms.toLowerCase() !== 'scanner') continue;

                    var planId = plan.id;
                    if (!planId) continue;

                    var action = 'upgrade';
                    if (planId == appData.packageId) {
                        plan.interval = appData.subscrInterval;
                        if (appData.endDate) {
                            var endDate = new Date(appData.endDate);
                            action = (today <= endDate) ? 'cancel' : 'upgrade';
                        } else {
                            action = 'cancel';
                        }
                    }
                    plan.action = action;
                    appData.plans.push(plan);
                }
            });
        });
    }

    // Render UI with fetched data
    function renderUI() {
        renderScanScore();
        renderLastScanned();
        renderPlanInfo();
        renderPlans();
        renderViolationReport();
    }

    // Render scan score
    function renderScanScore() {
        var scanScoreElement = document.getElementById('scan-score');

        if (appData.isExpired == 1) {
            scanScoreElement.innerHTML = '<span class="status-value status-inactive">N/A</span>';
        } else if (appData.scanViolationTotal == 0) {
            scanScoreElement.innerHTML = '<span class="status-value status-inactive">N/A</span>';
        } else {
            scanScoreElement.innerHTML = appData.successPercentage + '%' +
                '<div class="progress-bar">' +
                '<div class="progress-fill" style="width: ' + appData.successPercentage + '%;"></div>' +
                '</div>' +
                '<div class="violations">' +
                'Violations: <span class="status-value" style="font-size: 15px;">' + appData.totalFailSum + '</span>' +
                '</div>';
        }
    }

    // Render last scanned
    function renderLastScanned() {
        var lastScannedElement = document.getElementById('last-scanned');

        if (appData.urlScanStatus < 2 || appData.scanStatus == 0) {
            lastScannedElement.innerHTML = '<img src="'+appData.imagesPaths+'not-shared.svg" alt="" title="Not Started">Not Started';
            lastScannedElement.className = 'status-value status-inactive';
        } else if (appData.scanStatus == 1 || appData.scanStatus == 2) {
            lastScannedElement.innerHTML = '<img src="'+appData.imagesPaths+'not-shared.svg" alt="" title="Scanning in process">Scanning<br>' +
                appData.totalScanPages + '/' + appData.totalSelectedPages;
            lastScannedElement.className = 'status-value status-inactive';
        } else if (appData.scanStatus == 3) {
            var formattedDate = '';
            if (appData.lastScan) {
                var date = new Date(appData.lastScan);
                formattedDate = date.toLocaleDateString('en-US', {year: 'numeric',month: 'long',day: 'numeric'});
            }

            lastScannedElement.innerHTML = appData.totalScanPages + ' Pages<br>' + formattedDate;
            lastScannedElement.className = 'status-value status-active';
        }
    }

    // Render plan info
    function renderPlanInfo() {
        var planNameElement = document.getElementById("plan-name");
        var planPagesElement = document.getElementById("plan-pages");
        var planBadgeElement = document.getElementById("plan-badge");
        var planRenewalElement = document.getElementById("plan-renewal");
        var cancelBtnElement = document.getElementById("cancel-subscription-btn");


        // Plan badge
        var today = new Date().toISOString().split("T")[0];
        var cancelDate = appData.cancelDate
            ? appData.cancelDate.substring(0, 10)
            : null;
        var endDateStr = appData.endDate
            ? appData.endDate.substring(0, 10)
            : null;
        // TRUE expired condition
        var isExpired = appData.isExpired == 1 ||
            (endDateStr && endDateStr < today);
        // TRUE cancelled condition (but not expired yet)
        var isCancelled = cancelDate && cancelDate <= today && !isExpired;

        // Plan name
        if (isExpired) {
            planNameElement.innerHTML =
                '<span style="color: #9F0000; font-weight: 700;">Your Plan has Expired</span>';
        } else {
            planNameElement.textContent =
                appData.isTrialPeriod == 1 ? "Free Plan" : appData.packageName + " Plan";
        }

        // Plan pages
        if (!isExpired) {
            planPagesElement.textContent = "Scan up to " + appData.pageViews + " Pages";
        } else {
            planPagesElement.textContent = "";
        }

        /*var today = new Date().toISOString().split("T")[0];
        var cancelDate = appData.cancelDate
            ? appData.cancelDate.substring(0, 10)
            : "";
        var isCancelled = (cancelDate && cancelDate <= today) || appData.isExpired;*/

        if (isExpired) {
            planBadgeElement.style.display = "none";
        } else if (isCancelled) {
            planBadgeElement.style.display = "inline-block";
            planBadgeElement.style.color = "#940000";
            planBadgeElement.style.background = "#ffd1d1";
            planBadgeElement.textContent = "Cancelled Plan";
        } else {
            planBadgeElement.style.display = "inline-block";
            planBadgeElement.style.color = "green";
            planBadgeElement.style.background = "#D1FFD3";
            planBadgeElement.textContent = "Current Plan";
        }

        // Plan renewal
        if (!isExpired && appData.endDate) {
            var endDate = new Date(appData.endDate);
            var formattedDate = endDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });

            if (isCancelled) {
                planRenewalElement.innerHTML =
                    "Expires on: <strong>" + formattedDate + "</strong>";
            } else {
                planRenewalElement.innerHTML =
                    "Renews on: <strong>" + formattedDate + "</strong>";
            }
        } else if (isExpired && appData.endDate) {
            var endDate = new Date(appData.endDate);
            var formattedDate = endDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
            planRenewalElement.innerHTML =
                "Expired on: <strong>" + formattedDate + "</strong>";
        }

        // Cancel/Renew button
        // var showRenew = cancelDate <= today || isExpired;
        var showRenew = isExpired || isCancelled;
        if (showRenew) {
            cancelBtnElement.style.backgroundColor = "#420083";
            cancelBtnElement.style.color = "#fff";
            cancelBtnElement.textContent = "Renew Plan";
        } else {
            cancelBtnElement.style.backgroundColor = "";
            cancelBtnElement.style.color = "";
            cancelBtnElement.textContent = "Cancel Subscription";
        }
    }

    // Render plans
    function renderPlans() {
        var monthlyPlansContainer = document.getElementById("monthly-plans");
        var annualPlansContainer = document.getElementById("annual-plans");

        var icons = ["diamond", "pentagon", "hexagon", "hexagon"];

        monthlyPlansContainer.innerHTML = "";
        annualPlansContainer.innerHTML = "";

        for (var i = 0; i < appData.plans.length; i++) {
            var plan = appData.plans[i];
            var icon = icons[i] || "default.svg";
            var iconPath = appData.imagesPaths + icon;
            var today = new Date().toISOString().split("T")[0];
            var cancelDate = appData.cancelDate ? appData.cancelDate.substring(0, 10): null;
            var endDateStr = appData.endDate ? appData.endDate.substring(0, 10): null;
            var isExpired = appData.endDate && new Date(appData.endDate) < new Date();
            var isTrial = appData.isTrialPeriod == 1;
            var isCancelled = cancelDate && cancelDate <= today && !isExpired;
            var isCurrentMonthly = appData.packageId == plan.id && plan.interval == "M" && !isTrial;

            // FORCE upgrade if trial
            var isActiveCurrentMonthly = isCurrentMonthly && !isCancelled && !isExpired;
            var monthlyAction = isExpired || isTrial || isCancelled
                ? "upgrade"
                : (isActiveCurrentMonthly ? "cancel" : "upgrade");

            var monthlyButtonClass =
                "upgrade-btn" +
                (isActiveCurrentMonthly ? " cancel-btnn" : "");

            var monthlyButtonText = isExpired || isTrial || isCancelled
                ? "Upgrade"
                : (isActiveCurrentMonthly ? "Cancel" : "Upgrade");
            var monthlyCard =
                '<div class="tier" data-plan-id="' +
                plan.id +
                '">' +
                '<div class="pricing-top">' +
                '<div class="pricing-header">' +
                '<div class="icon-circle">' +
                '<img src="' +
                iconPath +
                '" alt="" height="20" width="20">' +
                "</div>" +
                "</div>" +
                '<div class="pricing-info">' +
                '<h3 class="tier-title">' +
                plan.name +
                "</h3>" +
                '<p class="tier-pages">' +
                plan.page_views +
                " Pages</p>" +
                "</div>" +
                "</div>" +
                '<hr class="pricing-divider">' +
                '<div class="pricing-body">' +
                '<p class="old-price">$' +
                plan.strick_monthly_price +
                "</p>" +
                '<p class="new-price">$' +
                plan.monthly_price +
                '<span class="per-year">/Monthly</span></p>' +
                "</div>" +
                '<button type="button" class="' +
                monthlyButtonClass +
                '" data-action="' +monthlyAction +
                '" data-planid="' +plan.id +
                '" data-interval="M" >' +
                monthlyButtonText +
                "</button>" +
                "</div>";

            var isCurrentAnnual = appData.packageId == plan.id && plan.interval == "Y";
            var isActiveCurrentAnnual = isCurrentAnnual && !isCancelled && !isExpired;
            var annualAction = isExpired || isTrial || isCancelled
                ? "upgrade"
                : isActiveCurrentAnnual ? "cancel" : "upgrade";

            var annualButtonClass =
                isActiveCurrentAnnual
                    ? "upgrade-btn cancel-btnn"
                    : "upgrade-btn";
            var annualCard =
                '<div class="tier" data-plan-id="' +
                plan.id +
                '">' +
                '<div class="pricing-top">' +
                '<div class="pricing-header">' +
                '<div class="icon-circle">' +
                '<img src="' +
                iconPath +
                '" alt="" height="20" width="20">' +
                "</div>" +
                "</div>" +
                '<div class="pricing-info">' +
                '<h3 class="tier-title">' +
                plan.name +
                "</h3>" +
                '<p class="tier-pages">' +
                plan.page_views +
                " Pages</p>" +
                "</div>" +
                "</div>" +
                '<hr class="pricing-divider">' +
                '<div class="pricing-body">' +
                '<p class="old-price">$' +
                plan.strick_price +
                "</p>" +
                '<p class="new-price">$' +
                plan.price +
                '<span class="per-year">/Year</span></p>' +
                "</div>" +
                '<button type="button" class="' +
                annualButtonClass +
                '" data-action="' +annualAction +
                '" data-planid="' +plan.id +
                '" data-interval="Y" >' +
                (isExpired || isTrial || isCancelled ? "Upgrade" : isActiveCurrentAnnual ? "Cancel" : "Upgrade") +
                "</button>" +
                "</div>";
            monthlyPlansContainer.innerHTML += monthlyCard;
            annualPlansContainer.innerHTML += annualCard;
        }
    }

    // Render violation report
    function renderViolationReport() {
        // Report date
        if (appData.lastScan) {
            var reportDate = new Date(appData.lastScan);
            var formattedDate = reportDate.toLocaleDateString('en-US', {day: 'numeric',month: 'long',year: 'numeric'});
            document.getElementById('report-date-value').textContent = formattedDate;
        }

        // Accessibility score
        document.getElementById('accessibility-score').textContent = appData.successPercentage + '%';
        document.getElementById('accessibility-progress').style.width = appData.successPercentage + '%';

        // Compliance status
        var percentage = parseInt(appData.successPercentage);
        var statusClass = '';
        var statusText = '';

        if (percentage >= 0 && percentage < 50) {
            statusClass = 'not-compliant';
            statusText = 'Not Compliant';
        } else if (percentage >= 50 && percentage < 85) {
            statusClass = 'semi-compliant';
            statusText = 'Semi Compliant';
        } else if (percentage >= 85) {
            statusClass = 'compliant';
            statusText = 'Compliant';
        }

        var complianceElement = document.getElementById('compliance-status');
        complianceElement.className = 'status-text ' + statusClass;
        complianceElement.textContent = statusText;

        // Pages scanned
        document.getElementById('pages-scanned').textContent = appData.totalScanPages;
        var pagesProgress = appData.totalPages > 0 ? (appData.totalScanPages / appData.totalPages * 100) : 0;
        document.getElementById('pages-progress').style.width = pagesProgress + '%';
        document.getElementById('pages-note').textContent = appData.totalScanPages + ' pages scanned out of ' + appData.totalPages;

        // WCAG checks
        var scanDetails = (appData.scanDetails && appData.scanDetails.withRemediation) ? appData.scanDetails.withRemediation : {};
        document.getElementById('failed-checks').textContent = scanDetails.total_fail || 0;
        document.getElementById('passed-checks').textContent = scanDetails.total_success || 0;
        document.getElementById('na-checks').textContent = (scanDetails.severity_counts && scanDetails.severity_counts.Not_Applicable) ? scanDetails.severity_counts.Not_Applicable : 0;

        // Violation levels
        document.getElementById('level-a-violations').textContent = (scanDetails.criteria_counts && scanDetails.criteria_counts.A) ? scanDetails.criteria_counts.A : 0;
        document.getElementById('level-aa-violations').textContent = (scanDetails.criteria_counts && scanDetails.criteria_counts.AA) ? scanDetails.criteria_counts.AA : 0;
        document.getElementById('level-aaa-violations').textContent = (scanDetails.criteria_counts && scanDetails.criteria_counts.AAA) ? scanDetails.criteria_counts.AAA : 0;
    }

    // Handle upgrade/cancel button clicks
    document.addEventListener("click", function(e) {
        if (e.target.classList.contains("upgrade-btn")) {
            console.log('update clickk',e.dataset);
            var planId = e.target.getAttribute("data-planid");
            var actionType = e.target.getAttribute("data-action");
            var interval = e.target.getAttribute("data-interval");
            var paypalSubscrId = appData.paypalSubscrId;
            //Force action to 'upgrade' if PayPal subscription ID is null or empty
            if (!paypalSubscrId || paypalSubscrId === 'null') {
                actionType = 'upgrade';
            }
            //Prepare request payload
            var payload = {
                website_id: appData.websiteId,
                current_package_id: appData.packageId,
                action: actionType
            };

            // Only include package_id and interval for upgrade
            if (actionType === 'upgrade') {
                payload.package_id = planId;
                payload.interval = interval;
            }
            getOpenLink(payload);
        }
    });

    var cancel_subscription_btn = document.getElementById("cancel-subscription-btn");
    cancel_subscription_btn.addEventListener("click", function() {
        // Prepare request payload
        var payload = {
            website_id: appData.websiteId,
            current_package_id: appData.packageId,
            action: 'cancel'
        };
        getOpenLink(payload);
    });

    function getOpenLink(payload) {
        var newWindow = window.open('', '_blank');
        fetch('https://skynetaccessibilityscan.com/api/generate-plan-action-link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(payload)
        }).then(function(response) {
            return response.json();
        }).then(function(data) {
            var redirectUrl = data.action_link || data.url;
            if (redirectUrl) {
                newWindow.location.href = redirectUrl;
            } else {
                newWindow.close();
            }
        }).catch(function(err) {
            console.error("API Error:", err);
            newWindow.close();
        });
    }

    // Handle violation link
    var view_all_violations = document.getElementById("view-all-violations");
    view_all_violations.addEventListener("click", function() {
        if (appData.violationLink) {
            window.open(appData.violationLink, '_blank');
        }
    });

    // Toggle between monthly and annual plans
    var toggle = document.getElementById("billing-toggle");
    var monthlyLabel = document.getElementById("monthly-label");
    var annualLabel = document.getElementById("annual-label");
    var monthlyclass = document.getElementById("monthlyclass");
    var annualclass = document.getElementById("annualclass");

    function showMonthly() {
        toggle.checked = false;
        monthlyLabel.classList.add("active");
        annualLabel.classList.remove("active");
        monthlyclass.style.display = "block";
        annualclass.style.display = "none";
    }
    function showAnnual() {
        toggle.checked = true;
        monthlyLabel.classList.remove("active");
        annualLabel.classList.add("active");
        monthlyclass.style.display = "none";
        annualclass.style.display = "block";
    }

    toggle.addEventListener("change", function() {
        if (toggle.checked) {
            showAnnual();
        } else {
            showMonthly();
        }
    });

    async function initializeApp() {
        const url = window.location.hostname;
        console.log('No URL parameter provided');
        if (!url) {
            console.error('No URL parameter provided');
            return;
        }

        // Register domain
        registerDomain(url).then(function() {
            // Fetch scan details
            return fetchScanDetails(url);
        }).then(function() {
            // Fetch scan count
            return fetchScanCount(url);
        }).then(function() {
            // Fetch packages
            return fetchPackages(url);
        }).then(function() {
            // Render the UI
            renderUI();
        }).catch(function(error) {
            console.error('Error initializing app:', error);
        });

    }
    window.onload = function () {
        initializeApp();
    };
    // Set initial state after data is loaded
    setTimeout(function() {
        if (appData.subscrInterval === 'Y') {
            showAnnual();
        } else {
            showMonthly();
        }
    }, 1000);

    // Show violation details
    var show_scan_details = document.getElementById("scan-score");
    show_scan_details.addEventListener("click", function() {
        document.getElementById("section1").style.display = "none";
        document.getElementById("section2").style.display = "block";
    });

    // Go back to main view
    var go_back = document.getElementById("back-btn");
    go_back.addEventListener("click", function() {
        document.getElementById("section2").style.display = "none";
        document.getElementById("section1").style.display = "block";
    });

})(jQuery);