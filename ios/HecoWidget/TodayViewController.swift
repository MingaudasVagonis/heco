//
//  TodayViewController.swift
//  HecoWidget
//
//  Created by Mingaudas Vagonis on 2020-07-30.
//

import UIKit
import NotificationCenter
import MapKit
import CoreLocation

struct Entry: Codable {
  var latitude: Double?
  var longitude: Double?
  var time: Double
}

struct DayEntry: Codable {
  var count: Int
  var tag: String
  var entries: [Entry]
}

struct Bucket:Codable {
  var label: String
  var days: [DayEntry]
}

class TodayViewController: UIViewController, NCWidgetProviding, CLLocationManagerDelegate {
  
  @IBOutlet weak var addButton: UIButton!
  @IBOutlet weak var counter: UILabel!
  @IBOutlet weak var label: UILabel!
  @IBOutlet weak var locationIndicator: UIImageView!
  
  let userDefaults = UserDefaults(suiteName:"group.lt.minvag.heco.widget.counting")
  
  let locationManager = CLLocationManager()
  
  var entry: DayEntry? = nil
  var bucket: Bucket? = nil
  var focus: String? = nil
  let format = DateFormatter()
  var lastLocation: CLLocation? = nil
  
  let encoder = JSONEncoder()
  @IBAction func increment(_ sender: Any) {
    
    self.entry?.count = self.entry!.count + 1
    self.counter.text = String(entry!.count);
    
    if self.lastLocation != nil {
      self.entry?.entries.append(Entry(
        latitude: self.lastLocation!.coordinate.latitude,
        longitude: self.lastLocation!.coordinate.longitude,
        time: Date().timeIntervalSince1970)
      )
    } else {
      self.entry?.entries.append(Entry(latitude: nil, longitude: nil, time: Date().timeIntervalSince1970))
    }
  }
  
  let decoder = JSONDecoder()
  override func viewDidLoad() {
    super.viewDidLoad()
    
    self.format.dateFormat = "yyyy-MM-dd"
    
    self.focus = setCounterLabel()
    
    (self.entry, self.bucket) = getDayEntry(focus: self.focus!, format: self.format)
    
    self.label.text = self.bucket!.label
    self.counter.text = String(self.entry!.count)
    
    if CLLocationManager.locationServicesEnabled() {
      self.locationManager.delegate = self
      self.locationManager.desiredAccuracy = kCLLocationAccuracyKilometer
      self.locationManager.requestLocation()
    }
    
  }
  
  override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)
    self.locationManager.requestLocation()
  }
  
  override func viewDidDisappear(_ animated: Bool) {
    super.viewDidDisappear(animated)
    
    let today = format.string(from: Date())
    
    if let index = self.bucket!.days.firstIndex(where: { $0.tag == today }) {
      self.bucket!.days[index] = self.entry!
    } else {
      self.bucket!.days.append(self.entry!)
    }
    
    if let encoded = try? encoder.encode(self.bucket){
      write(data: encoded, key: self.focus!)
    }
  }
  
  func getDayEntry(focus: String, format: DateFormatter) -> (DayEntry, Bucket) {
    
    let counter = getBucketString(focus: focus)
    let today = format.string(from: Date())
    
    if let decoded = try? self.decoder.decode(Bucket.self, from: counter.data(using: .utf8)!) {
      
      if let index = decoded.days.firstIndex(where: { $0.tag == today }) {
        return (decoded.days[index], decoded)
      }
      
      return (DayEntry(count:0, tag:today, entries:[]), decoded)
      
    }
    
    let entry = DayEntry(count:0, tag:today, entries:[])
    
    return (entry, Bucket(label: focus, days: [entry]))
  }
  
  func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
    if let location = locations.last {
      self.lastLocation = location
      self.locationIndicator.image = UIImage(named:"icon_location_on")
    }
  }
  
  func getBucketString(focus: String) -> String {
    if let counter = self.userDefaults?.string(forKey: focus) {
      return counter
    } else if let encoded = try? encoder.encode(Bucket(label: focus, days: [])){
        write(data: encoded, key: focus)
        return (self.userDefaults?.string(forKey: focus))!
    }
    
    return ""
  }
  
  func write(data: Data, key: String) {
     self.userDefaults?.set(String(data: data, encoding: .utf8)!, forKey: key)
     self.userDefaults?.synchronize()
  }
  
  func setCounterLabel() -> String? {
    if let ID = userDefaults?.string(forKey: "label-focus") {
      return ID
    }
    return "Counter"
  }
  
  func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
     print("error:: \(error.localizedDescription)")
   }
  
  func widgetPerformUpdate(completionHandler: (@escaping (NCUpdateResult) -> Void)) {
    completionHandler(NCUpdateResult.newData)
  }
  
  
}
