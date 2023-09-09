public without sharing class HealthRecordController {
    @AuraEnabled(cacheable=true)
    public static List<HealthRecord__c> getHealthRecords(String selectedUser) {
        System.debug('selectedUser> ' + selectedUser);
        if(selectedUser != null){
            // Query health records based on the selected user (you can add more filters as needed)
            return convertDateIntoUserTZ([SELECT Id, Phase__c, Date_and_Time__c, Morning_Time__c, Morning_BP_Reading_Up__c, Morning_BP_Reading_Down__c, Morning_Medicine__c, Evening_Time__c, Evening_BP_Reading_Up__c, Evening_BP_Reading_Down__c, Evening_Medicine__c
                    FROM HealthRecord__c
                    WHERE User__c = :selectedUser
                    ORDER BY Date_and_Time__c, Morning_Time__c]);
        }else{
            return new List<HealthRecord__c>();
        }
    }

    private static List<HealthRecord__c> convertDateIntoUserTZ(List<HealthRecord__c> healthRecords){
        for(HealthRecord__c healthRecord : healthRecords){
            if(healthRecord.Date_and_Time__c != null){
                TimeZone tz = UserInfo.getTimeZone();
                healthRecord.Date_and_Time__c = convertTZtoGMT(healthRecord.Date_and_Time__c, tz.getID());
            }
        }

        return healthRecords;
    }


    @AuraEnabled(cacheable=true)
    public static List<AllUsersWrapper> getUniqueUsers() {
        Set<String> uniqueUsers = new Set<String>();

        // Query distinct User values from HealthRecord__c
        List<AggregateResult> results = [SELECT User__c FROM HealthRecord__c GROUP BY User__c];

        // Add unique User values to the list
        for (AggregateResult result : results) {
            String userValue = (String)result.get('User__c');
            if (userValue != null) {
                uniqueUsers.add(userValue);
            }
        }

        List<AllUsersWrapper> wrapperList = new List<AllUsersWrapper>();
        for(String user : uniqueUsers){
            AllUsersWrapper wrapper = new AllUsersWrapper();
            wrapper.label = user;
            wrapper.value = user;
            wrapperList.add(wrapper);
        }

        return wrapperList;
    }

    public static Datetime convertGMTtoTZ(Datetime dt, String timeZoneName) {
        return doConversion(dt, timeZoneName, false);
    }

    public static Datetime convertTZtoGMT(Datetime dt, String timeZoneName) {
        return doConversion(dt, timeZoneName, true);
    }

    private static Datetime doConversion(Datetime dt, String timeZoneName, Boolean addOrRemove) {
        Integer multiplier = (addOrRemove ? 1 : -1);
        Integer offsetInMinute = getTimezoneOffsetInMinutes(dt, timeZoneName);
        dt = dt.addMinutes(multiplier * offsetInMinute);
        return dt;
    }

    private static Integer getTimezoneOffsetInMinutes(Datetime dt, String timeZoneName) {
        TimeZone storeTimeZone = TimeZone.getTimeZone(timeZoneName);
        Integer offsetInMinute = storeTimeZone.getOffset(dt) / (60 * 1000);
        return offsetInMinute;
    }

    public class AllUsersWrapper{
        @AuraEnabled
        public String label {get; set;}
        @AuraEnabled
        public String value {get; set;}
    }
}